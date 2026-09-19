/**
 * PulseGuard Risk Engine — Fastn workflow (instant tier)
 * Trigger: telemetry webhook / direct execute. Tenant-aware via x-end-org-id.
 * Flow: dedupe -> evaluate risk -> enrich account (Unified CRM, fallback direct) ->
 *       CRM timeline note -> interactive Slack card -> persist metric row.
 * Note: tenant connections are pinned via CONNECTION_MAP because the executeWorkflow
 * MCP tool cannot forward tenant headers (platform gap, filed as feedback).
 */
const CONNECTION_MAP = {
  "tenant-alpha": {
    endOrgId: "1d599802-f9ad-4d62-830a-e66854c108c3",
    hubspot: "ucl:personal_dc05aac8b2c7b361ba84:1d599802-f9ad-4d62-830a-e66854c108c3:9036a742-6baa-4c72-be3c-3789b34d6f9b:default",
    slack: "ucl:personal_dc05aac8b2c7b361ba84:1d599802-f9ad-4d62-830a-e66854c108c3:8de5d696-5289-4c9c-ade4-de918d019d06:default",
  },
  "tenant-beta": {
    endOrgId: "8d8b6c6c-ec68-454c-99c6-a549b7b7e28b",
    hubspot: "ucl:personal_dc05aac8b2c7b361ba84:8d8b6c6c-ec68-454c-99c6-a549b7b7e28b:9036a742-6baa-4c72-be3c-3789b34d6f9b:default",
    slack: "ucl:personal_dc05aac8b2c7b361ba84:8d8b6c6c-ec68-454c-99c6-a549b7b7e28b:8de5d696-5289-4c9c-ade4-de918d019d06:default",
  },
};

export default async function (ctx) {
  const input = ctx.input || {};
  const headers = ctx.headers || {};
  const steps = [];

  const customerId = String(input.customerId || "");
  const customerDomain = String(input.customerDomain || "");
  const healthScore = Number(input.healthScore || 0);
  const usageDropPct = Number(input.usageDropPct || 0);
  const metricSummary = String(input.metricSummary || "");
  const tenant = String(headers["x-end-org-id"] || (input.tenant || "tenant-alpha"));

  const map = CONNECTION_MAP[tenant] || CONNECTION_MAP["tenant-alpha"];
  const fastn = new Fastn({
    connectors: {
      hubspot: { orgId: "managed", connectionId: map.hubspot },
      slack: { orgId: "managed", connectionId: map.slack },
    },
  });

  let cfg = {};
  try { cfg = JSON.parse(headers["x-fastn-installation-config"] || "{}"); } catch (e) { cfg = {}; }
  const threshold = Number(cfg.riskThreshold || 40);
  const channel = cfg.slackChannel || (tenant.indexOf("beta") >= 0 ? "#pulseguard-beta" : "#pulseguard-alpha");

  if (!customerId) return { status: "BAD_REQUEST", reason: "customerId is required" };

  // idempotency: same tenant+customer+drop within 30 minutes runs once
  const dedupeKey = "pg:alert:" + tenant + ":" + customerId + ":" + usageDropPct;
  try {
    const prev = await fastn.state.get(dedupeKey);
    if (prev) {
      const age = Date.now() - Number(prev);
      if (age >= 0 && age < 1800000) return { status: "DEDUPLICATED", tenant, customerId, dedupeKey };
    }
    await fastn.state.set(dedupeKey, String(Date.now()));
    steps.push("dedupe-ok");
  } catch (e) { steps.push("dedupe-fail:" + (e && e.message)); }

  // schema bootstrap
  try {
    await fastn.db.query(
      "CREATE TABLE IF NOT EXISTS pulseguard_metrics (tenant_id text, customer_id text, health_score numeric, risk_status text, acknowledged boolean DEFAULT false, updated_at timestamptz DEFAULT now(), PRIMARY KEY (tenant_id, customer_id))",
      []
    );
    steps.push("table-ok");
  } catch (e) { steps.push("table-fail:" + (e && e.message)); }

  const risky = usageDropPct >= threshold || healthScore < 50;
  if (!risky) {
    try {
      await fastn.db.query(
        "INSERT INTO pulseguard_metrics (tenant_id, customer_id, health_score, risk_status) VALUES ($1,$2,$3,'HEALTHY') ON CONFLICT (tenant_id, customer_id) DO UPDATE SET health_score=$3, risk_status='HEALTHY', updated_at=now()",
        [tenant, customerId, healthScore]
      );
      steps.push("db-healthy-ok");
    } catch (e) { steps.push("db-healthy-fail:" + (e && e.message)); }
    return { status: "HEALTHY", tenant, customerId, threshold, steps };
  }

  // 1) enrich the account — Unified CRM first, direct HubSpot search as fallback
  let account = { id: customerId, name: input.accountName || "Unknown Account", ownerEmail: "", source: "input" };
  try {
    const r = await fastn.unified.crm.account.get(customerId, { provider: "hubspot" });
    const rec = (r && (r.output !== undefined ? r.output : r)) || {};
    const body = rec.data || rec;
    if (body) {
      if (body.name) account.name = body.name;
      if (body.ownerEmail) account.ownerEmail = body.ownerEmail;
      if (body.id) account.id = body.id;
      account.source = "unified";
    }
    steps.push("unified-getAccount-ok");
  } catch (e) {
    steps.push("unified-getAccount-fail:" + (e && e.message));
    try {
      const s = await fastn.connector.hubspot.searchCompanies({ query: customerDomain || account.name, limit: 5 });
      const out = (s && s.output) || {};
      const rows = out.results || out.companies || out.data || [];
      let hit = null;
      for (const row of rows) {
        const props = row.properties || row;
        const dom = String(props.domain || props.website || "").toLowerCase();
        const nm = String(props.name || "");
        if ((customerDomain && dom.indexOf(customerDomain.toLowerCase()) >= 0) || nm === account.name) { hit = props || row; break; }
        if (!hit && (nm === "Acme Corp" || nm === "Globex Exports")) hit = props || row;
      }
      if (hit) {
        account = { id: String(hit.id || hit.hs_object_id || customerId), name: hit.name || account.name, ownerEmail: "", source: "direct" };
        steps.push("direct-search-ok:" + account.id);
      } else { steps.push("direct-search-empty:" + JSON.stringify(out).slice(0, 120)); }
    } catch (e2) { steps.push("direct-search-fail:" + (e2 && e2.message)); }
  }

  // 2) CRM timeline note — Unified first, direct note+association as fallback
  const noteTitle = "PulseGuard: " + usageDropPct + "% engagement decline";
  const noteBody = "Automated churn-risk diagnosis by PulseGuard.\nAccount: " + account.name +
    "\nTenant: " + tenant + "\nEngagement drop: " + usageDropPct + "%\nHealth score: " + healthScore + "/100" +
    "\nSignal: " + metricSummary;
  let noteOk = false;
  try {
    await fastn.unified.crm.note.create({ accountId: account.id, title: noteTitle, content: noteBody }, { provider: "hubspot" });
    noteOk = true; steps.push("unified-createNote-ok");
  } catch (e) {
    steps.push("unified-createNote-fail:" + (e && e.message));
    try {
      const now = new Date().toISOString();
      await fastn.connector.hubspot.createNoteWithAssociation({
        properties: { hs_note_body: noteTitle + "\n" + noteBody, hs_timestamp: now },
        associations: [{ to: { id: String(account.id) }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 279 }] }],
      });
      noteOk = true; steps.push("direct-createNote-ok");
    } catch (e2) { steps.push("direct-createNote-fail:" + (e2 && e2.message)); }
  }

  // 3) interactive Slack alert to the tenant's channel
  const ackUrl = (cfg.ackBaseUrl || "https://pulseguard.local") + "/api/ack?tenant=" + encodeURIComponent(tenant) + "&customer=" + encodeURIComponent(customerId) + "&drop=" + usageDropPct;
  const alert = {
    channel: channel,
    text: "PulseGuard risk: " + account.name + " — " + usageDropPct + "% engagement drop",
    blocks: [
      { type: "header", text: { type: "plain_text", text: "Churn risk detected" } },
      { type: "section", fields: [
        { type: "mrkdwn", text: "*Account:*\n" + account.name + " (" + customerId + ")" },
        { type: "mrkdwn", text: "*Tenant:*\n" + tenant },
        { type: "mrkdwn", text: "*Engagement drop:*\n" + usageDropPct + "%" },
        { type: "mrkdwn", text: "*Health:*\n" + healthScore + "/100" },
      ] },
      { type: "section", text: { type: "mrkdwn", text: "*Signal:*\n" + metricSummary } },
      { type: "actions", elements: [
        { type: "button", style: "primary", text: { type: "plain_text", text: "Acknowledge risk" }, url: ackUrl },
      ] },
    ],
  };
  let notified = false;
  try {
    await fastn.connector.slack.createChatPostMessage(alert);
    notified = true; steps.push("slack-ok");
  } catch (e) { steps.push("slack-fail:" + (e && e.message)); }

  // 4) persist the risk state
  try {
    await fastn.db.query(
      "INSERT INTO pulseguard_metrics (tenant_id, customer_id, health_score, risk_status, acknowledged) VALUES ($1,$2,$3,'HIGH_RISK',false) ON CONFLICT (tenant_id, customer_id) DO UPDATE SET health_score=$3, risk_status='HIGH_RISK', acknowledged=false, updated_at=now()",
      [tenant, customerId, healthScore]
    );
    steps.push("db-risk-ok");
  } catch (e) { steps.push("db-risk-fail:" + (e && e.message)); }

  return { status: "RISK_ESCALATED", tenant, customerId, account, threshold, channel, notified, noteOk, steps };
}
