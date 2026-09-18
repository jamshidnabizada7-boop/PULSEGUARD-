# PULSEGUARD — Championship Implementation Plan
**Team hackathon-aryan · Build With Fastn Hackathon · Target: 1st place (150,000 PKR)**

> Operating manual for the next 24 hours. Everything in Phases 1–2 is built THROUGH the Fastn
> MCP gateway (that alone carries the 30–40 point MCP bucket). The end state is a deployed
> production product with real Fastn executions — not a scripted mock.

---

## 0. Scoring alignment (from the onboarding session, verified)

| Criterion | Points | How PulseGuard maxes it |
|---|---|---|
| Creativity | 30 | Closed-loop churn radar (detect → enrich → CRM note → interactive Slack card → acknowledge → CRM update). Not one of the 4 example tracks. |
| MCP usage | 20 → likely 30–40 | Entire backend built via `mcp__fastn__*` tool calls from ZCode (+ Antigravity segment on camera). |
| Implementation | 20 | Live published workflows, real webhook triggers, real CRM/Slack writes, executions visible in Fastn logs, production URL on Vercel. |
| Submission | remainder | 2:30 video (scripted below), Markdown doc, screenshots, both mandatory forms. |
| Bonus | discretionary | Evidence-backed bug reports (we already hold three). |

**Logistics hard rules:** org named `hackathon-aryan`; original CNIC (or Form B) at NUST SEECS
tomorrow; on-site presence required to receive prize; both forms filled on-site; team lead
receives prize; progress must be visible from today.

---

## 1. Corrections applied vs. the original draft

| Draft said | Reality (verified) |
|---|---|
| Tools `create_flow`, `find_tools`, `run_flow`, `execute_tool` | Actual gateway tools: `skill`, `search_tools`, `run_tool`, `list_connectors`, `get_connector`, `list_audit`, `save_custom_tool`, `run_custom_tool`, + ~110 `fastnPlatform__*` (`createWorkflow`, `editWorkflowCode`, `executeWorkflow`, `createWebhookConfig`, `createWidget`, `listSecrets`, …) |
| API key in MCP config headers | Gateway rejects ALL API keys with 401 (verified with live/test keys × 8 header variants). OAuth works. Keys still needed for server-side embed-token minting + webhook curl — verify on app host in Hour 1. |
| Iframe with `?x-end-org-id=` query param | Production pattern: backend mints `POST /api/v1/embed/token` (8h token, auto-refresh, 7-day session cap, `fastn:session-expired` postMessage). Docs explicitly call the query-param/live-token-in-URL pattern "wrong for production". |
| Only `fastn.db`, `fastn.secrets` | Also use `fastn.state` (durable KV, ORG/INVOCATION scope — idempotency guards) and `fastn.diff.compare` (sync reports). `fastn.db` is per-workspace Postgres `ws_*` → tenant_id column + predicate is MANDATORY (isolation is per-workspace, not per-customer). |
| Console `app.fastn.ai` | Base host is your deployment, e.g. `app.fastn.dev` — confirm from the workspace URL / workflow API tab. |

---

## 2. Product definition

**PulseGuard** = autonomous churn radar with a **closed loop**, embedded as the Integrations
Center of a real host SaaS, **PulseGrid Analytics** (Next.js 14, dark theme, on Vercel).

```
PulseGrid Analytics (Vercel, Next.js 14)
├── Dashboard page — account health table, sparklines, risk badges, tenant switcher
├── Integrations page — Fastn widget (minted embed token) = tenant connects own CRM/Slack
├── Runs page — live Fastn execution log (via Instant-tier API workflow)
└── API routes — /api/embed-token (mint per-tenant token), /api/telemetry (send + simulate)

Fastn workspace (hackathon-aryan) — all built via MCP
├── Workflow: pulseguard-risk-engine (Standard tier)
│     webhook telemetry → tenant config → fastn.db baseline → threshold eval
│     → unified.crm.getAccount → unified.crm.createNote (risk diagnosis)
│     → connector.slack.postMessage (interactive card w/ Acknowledge button)
│     → fastn.db upsert (risk state) 
├── Workflow: pulseguard-ack-loop (Instant tier)
│     Slack action → webhook → fastn.db mark acknowledged → CRM follow-up note → Slack reply
├── Workflow: pulseguard-weekly-digest (Scheduler)
│     fastn.db trends → digest card to Slack + CRM note
├── Triggers: pulseguard-telemetry-webhook, pulseguard-ack-webhook, cron 0 */12 * * *
└── Widget: Integrations Center (connect CRM/Slack, set riskThreshold + channel, themed)
```

**Why judges care:** it mirrors the HP Workforce Experience architecture the judge demoed
(monitor → alert via Teams → BI sync) but goes further: per-tenant config, two-way loop,
and an actual product UI. It is NOT one of the 4 example tracks.

---

## 3. UI/UX specification (host app)

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui · Recharts · Vercel.

**Design system:** dark-first (`#0B0F17` bg, `#101827` panels, cyan/indigo accents, 8px radii,
Inter font), skeleton loaders, empty states with illustrations, toast feedback. Brand:
"PulseGuard — Retention Radar" with a pulse-line logo mark.

**Pages:**
1. `/` Dashboard — header w/ PulseGrid logo + tenant switcher (Tenant-Alpha ↕ Tenant-Beta);
   KPI cards (Accounts at risk, Avg health, Open risks, Acknowledged); health table
   (account, owner, health sparkline, WoW Δ, risk badge); "⚡ Simulate anomaly" button
   (posts real telemetry to the Fastn webhook); risks panel showing acknowledged state.
2. `/integrations` — Embeds the Fastn widget full-height ("Connect your CRM & messaging"),
   connection status cards fetched via Instant-tier workflow wrapping platform API.
3. `/runs` — live table of Fastn executions (id, workflow, status, duration, time), auto-refresh
   every 5s, detail drawer with payload — proof of "real executions" without opening Fastn.

**Production embedding:** `/api/embed-token` route (server-only) mints tokens per tenant:
`POST {APP_HOST}/api/v1/embed/token` with `Authorization: Bearer <API_KEY>` + `x-org-id`,
body `{ endOrgId }` → returns `emb_…` (8h). Frontend mounts iframe/SDK with that token;
listens for `fastn:session-expired` → re-mint. API key never reaches the browser.

---

## 4. Workflow code (canonical, deployed via `editWorkflowCode`)

### 4.1 pulseguard-risk-engine (Standard tier)

```javascript
export default async function (ctx) {
  const { customerId, healthScore, usageDropPct, metricSummary } = ctx.input;
  const tenant = ctx.headers['x-end-org-id'] || 'tenant-alpha';
  const cfg = ctx.headers['x-fastn-installation-config']
    ? JSON.parse(ctx.headers['x-fastn-installation-config']) : {};
  const threshold = Number(cfg.riskThreshold ?? 40);
  const channel   = cfg.slackChannel || '#pulseguard-alerts';

  // idempotency: same tenant+customer+drop within 30min runs once
  const dedupeKey = `alert:${tenant}:${customerId}:${usageDropPct}`;
  const seen = await fastn.state.get(dedupeKey);
  if (seen) return { status: 'DEDUPLICATED', tenant, customerId };

  const risky = Number(usageDropPct) >= threshold || Number(healthScore) < 50;
  if (!risky) {
    await fastn.db.query(
      `INSERT INTO tenant_metrics (tenant_id, customer_id, health_score, risk_status, updated_at)
       VALUES ($1,$2,$3,'HEALTHY',NOW())
       ON CONFLICT (tenant_id, customer_id) DO UPDATE SET health_score=$3, risk_status='HEALTHY', updated_at=NOW()`,
      [tenant, customerId, healthScore]);
    return { status: 'HEALTHY', tenant, customerId };
  }

  // enrich from tenant's CRM via Unified API
  let account = { name: 'Unknown Account', ownerEmail: 'unassigned@pulsegrid.io' };
  try {
    const r = await fastn.unified.crm.getAccount({ recordId: customerId });
    if (r?.data) account = { name: r.data.name || account.name, ownerEmail: r.data.ownerEmail || account.ownerEmail };
  } catch (e) { console.error('unified.getAccount:', e.message); }

  // CRM timeline note
  try {
    await fastn.unified.crm.createNote({
      accountId: customerId,
      title: `PulseGuard: ${usageDropPct}% engagement decline`,
      content: `Automated churn-risk diagnosis.\nDrop: ${usageDropPct}%\nHealth: ${healthScore}/100\nSignal: ${metricSummary}\nOwner: ${account.ownerEmail}`
    });
  } catch (e) { console.error('unified.createNote:', e.message); }

  // interactive Slack card (Acknowledge → action → pulseguard-ack-webhook)
  try {
    await fastn.connector.slack.postMessage({
      channel, text: `PulseGuard risk: ${account.name}`,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: '🚨 Churn risk detected' } },
        { type: 'section', fields: [
          { type: 'mrkdwn', text: `*Account:*\n${account.name} (${customerId})` },
          { type: 'mrkdwn', text: `*Tenant:*\n${tenant}` },
          { type: 'mrkdwn', text: `*Engagement drop:*\n${usageDropPct}%` },
          { type: 'mrkdwn', text: `*Health:*\n${healthScore}/100` } ] },
        { type: 'section', text: { type: 'mrkdwn', text: `*Signal:*\n${metricSummary}` } },
        { type: 'actions', elements: [
          { type: 'button', style: 'primary', text: { type: 'plain_text', text: '✅ Acknowledge' },
            action_id: 'pulseguard_ack',
            url: `${process.env.PULSEGRID_URL || 'https://pulseguard.app'}/api/ack?tenant=${tenant}&customer=${encodeURIComponent(customerId)}` } ] }
      ] });
  } catch (e) { console.error('slack.postMessage:', e.message); }

  await fastn.db.query(
    `INSERT INTO tenant_metrics (tenant_id, customer_id, health_score, risk_status, updated_at)
     VALUES ($1,$2,$3,'HIGH_RISK',NOW())
     ON CONFLICT (tenant_id, customer_id) DO UPDATE SET health_score=$3, risk_status='HIGH_RISK', updated_at=NOW()`,
    [tenant, customerId, healthScore]);
  await fastn.state.set(dedupeKey, String(Date.now()), { ttlSeconds: 1800 });
  return { status: 'RISK_ESCALATED', tenant, customerId, notified: channel };
}
```
*(If Slack block-kit `actions`/`url` buttons aren't supported by the connector, the Acknowledge
button links to `/api/ack` on PulseGrid, which server-side POSTs to `pulseguard-ack-webhook` —
same closed loop, zero dependency on Slack interactive payloads.)*

### 4.2 pulseguard-ack-loop (Instant tier)

```javascript
export default async function (ctx) {
  const { tenant, customerId, ackBy } = ctx.input;
  await fastn.db.query(
    `UPDATE tenant_metrics SET risk_status='ACKNOWLEDGED', updated_at=NOW()
     WHERE tenant_id=$1 AND customer_id=$2`, [tenant, customerId]);
  await fastn.state.set(`ack:${tenant}:${customerId}`, ackBy || 'CS team');
  try {
    await fastn.unified.crm.createNote({
      accountId: customerId,
      title: 'PulseGuard: risk acknowledged',
      content: `CS acknowledged the churn-risk alert. Next review scheduled.` });
  } catch (e) { console.error(e.message); }
  return { status: 'ACKNOWLEDGED', tenant, customerId };
}
```

### 4.3 pulseguard-weekly-digest (Scheduler, `0 */12 * * *`)

Reads `fastn.db` trends per tenant → posts a summary card to Slack + a CRM note. **Cut line if
time runs short** — the alert loop + widget + two tenants are the non-negotiable MVP.

---

## 5. Phase plan with exit criteria

### P0 — Setup (now → +1h)
1. Write this doc ✅ · fetch gateway `skill` manual · `search_tools` for schemas of:
   `fastnPlatform__createWorkflow`, `editWorkflowCode`, `executeWorkflow`,
   `createWebhookConfig`, `createWidget`, `listConnectors`, `run_tool`, `listConnections`.
2. Org → `hackathon-aryan` (Settings → General). Invite teammates (People).
3. **Verify API key on app host:** mint test embed token with curl; if 401 → fallback plan
   (dashboard 8h tokens) + flagship bug report. Verify webhook trigger URL shape at the same time.
4. Accounts (all free, ~30 min): Slack workspace (create new "PulseGrid Demo"), HubSpot free
   (primary CRM), Zoho free (Tenant-Beta CRM fallback; Teams cut unless trivial).
5. Connect in Fastn: Tenant-Alpha = HubSpot + Slack; Tenant-Beta = Zoho (or second Slack setup).
   Create 2 test accounts in each CRM (one healthy, one "at risk").

### P1 — Fastn backend via MCP (→ +4h) — EXIT: workflows Live, executions visible
`createWorkflow` (risk engine, Standard) → `editWorkflowCode` with §4.1 → `createWebhookConfig`
(telemetry + ack) → scheduler → create `tenant_metrics` table via a bootstrap workflow run
(`CREATE TABLE IF NOT EXISTS …`) → `createWidget` (CRM + Slack connectors; tenant-facing
`riskThreshold` numeric + `slackChannel` string; PulseGrid dark theme) → publish all → Live.
Every single action via `mcp__fastn__*` and screen-recorded.

### P2 — Host app on Vercel (→ +8h) — EXIT: public URL, widget renders, simulate works
Scaffold repo `pulseguard` (Next.js 14 + TS + Tailwind + shadcn/ui + Recharts) → build 3 pages
per §3 → `/api/embed-token`, `/api/telemetry`, `/api/ack` routes → push GitHub → Vercel →
env vars `FASTN_API_KEY`, `FASTN_ORG_ID`, `APP_HOST`, webhook URLs → production smoke test.

### P3 — E2E verification (→ +10h) — EXIT: full loop for BOTH tenants, screenshots
`curl` telemetry for Tenant-Alpha (drop 52%, health 38) → Slack card lands → HubSpot note on
account timeline → click Acknowledge → `/api/ack` → ack webhook → CRM note #2 → Runs page
shows all executions. Repeat Tenant-Beta → different CRM, isolated channels. Screenshots at
every step (workflow canvas, executions table, Slack, CRM timelines, widget, dashboard).

### P4 — Submission assets (→ +13h)
- **Video (2:30, scripted):** 0:00–0:25 problem (churn signals trapped outside CRM/CS tools)
  → 0:25–0:55 PulseGrid + embedded widget + tenant switch (isolation) → 0:55–1:25 live
  simulate → Slack card → CRM note → acknowledge closes loop → 1:25–2:05 MCP proof: ZCode +
  Antigravity conversation executing `fastnPlatform__*` calls that built the system →
  2:05–2:30 Fastn executions logs + architecture recap.
- **Doc (Markdown):** problem, architecture, DB schema, multi-tenant headers, unified endpoints,
  run instructions.
- **Bug reports (evidence attached):**
  1. mcp.fastn.dev rejects all API keys (live + test, 8 header variants, curl transcripts) while
     OAuth works; docs prescribe key auth for non-OAuth clients.
  2. Docs flip between `fastn.connector` and `fastn.connectors` in workflow runtime.
  3. `fastn.db` isolation is per-workspace (`ws_*`), not per-customer — suggest native
     tenant-scoping helpers.
  4. + anything we hit during P0–P3 (record as we go).
- Both mandatory forms on-site; feedback form includes the above.

### P5 — On-site (NUST SEECS)
3 screens: ① PulseGrid production (widget + tenant switch + simulate), ② Fastn Activity →
Executions (live), ③ agent terminal (ZCode/Antigravity MCP session). Live trigger on stage.
CNIC/Form-B at gate; check-in at hackathon-aryan desk; both forms submitted.

---

## 6. Risk register

| Risk | Fallback |
|---|---|
| HubSpot OAuth fails | Zoho CRM both tenants |
| App-host API keys broken (like gateway) | Dashboard 8h tokens + flagship bug report; embed-token route keeps code path for when fixed |
| Slack OAuth fails (seen in session) | Teams if available, else email connector; ack loop switches to web button only |
| Vercel/GitHub account friction | Netlify; last resort local + tunnel (token minting still server-side) |
| Time overrun | Cut digest workflow; never cut: risk engine + ack loop + widget + two tenants |
| Antigravity setup drags | ZCode alone carries the MCP segment |
| `tenant_metrics` table creation friction | Bootstrap via Instant workflow executing `CREATE TABLE` + auto-seed 6 demo accounts |

## 7. Rubric self-audit before submission
- [ ] Org `hackathon-aryan`, members invited, progress visible from today
- [ ] All backend artifacts created via MCP (audit trail in gateway exists)
- [ ] Workflows Live (not draft) with ≥5 Completed executions each
- [ ] Two tenants demonstrably isolated (different CRM + channels)
- [ ] Widget embedded with server-minted tokens on production URL
- [ ] Video ≤ 2:45 following script; doc complete; screenshots 6+; both forms; bug reports filed
