/**
 * PulseGuard Ack Loop — Fastn workflow (instant tier)
 * Fires when CS acknowledges a risk (host app /api/ack -> this workflow).
 * Closes the loop: DB acknowledged=true + CRM follow-up note + Slack confirmation.
 */
const CONNECTION_MAP = {
  "tenant-alpha": {
    hubspot: "ucl:personal_dc05aac8b2c7b361ba84:1d599802-f9ad-4d62-830a-e66854c108c3:9036a742-6baa-4c72-be3c-3789b34d6f9b:default",
    slack: "ucl:personal_dc05aac8b2c7b361ba84:1d599802-f9ad-4d62-830a-e66854c108c3:8de5d696-5289-4c9c-ade4-de918d019d06:default",
  },
  "tenant-beta": {
    hubspot: "ucl:personal_dc05aac8b2c7b361ba84:8d8b6c6c-ec68-454c-99c6-a549b7b7e28b:9036a742-6baa-4c72-be3c-3789b34d6f9b:default",
    slack: "ucl:personal_dc05aac8b2c7b361ba84:8d8b6c6c-ec68-454c-99c6-a549b7b7e28b:8de5d696-5289-4c9c-ade4-de918d019d06:default",
  },
};

export default async function (ctx) {
  const input = ctx.input || {};
  const tenant = String(input.tenant || (ctx.headers && ctx.headers["x-end-org-id"]) || "tenant-alpha");
  const customerId = String(input.customerId || "");
  const ackBy = String(input.ackBy || "Customer Success");
  const map = CONNECTION_MAP[tenant] || CONNECTION_MAP["tenant-alpha"];
  const fastn = new Fastn({
    connectors: { hubspot: { orgId: "managed", connectionId: map.hubspot }, slack: { orgId: "managed", connectionId: map.slack } },
  });
  const steps = [];

  if (!customerId) return { status: "BAD_REQUEST", reason: "customerId required" };

  try {
    await fastn.db.query(
      "UPDATE pulseguard_metrics SET risk_status='ACKNOWLEDGED', acknowledged=true, updated_at=now() WHERE tenant_id=$1 AND customer_id=$2",
      [tenant, customerId]
    );
    steps.push("db-ack-ok");
  } catch (e) { steps.push("db-ack-fail:" + (e && e.message)); }

  try {
    await fastn.unified.crm.note.create({ accountId: customerId, title: "PulseGuard: risk acknowledged", content: "CS acknowledged the churn-risk alert. Owner: " + ackBy + ". Retention play scheduled." }, { provider: "hubspot" });
    steps.push("unified-note-ok");
  } catch (e) {
    steps.push("unified-note-fail:" + (e && e.message));
    try {
      await fastn.connector.hubspot.createNoteWithAssociation({
        properties: { hs_note_body: "PulseGuard: risk acknowledged by " + ackBy + ". Retention play scheduled.", hs_timestamp: new Date().toISOString() },
        toObjectId: String(customerId),
        associationTypeId: "190",
      });
      steps.push("direct-note-ok");
    } catch (e2) { steps.push("direct-note-fail:" + (e2 && e2.message)); }
  }

  try {
    await fastn.state.set("pg:ack:" + tenant + ":" + customerId, ackBy + "@" + String(Date.now()));
    steps.push("state-ok");
  } catch (e) { steps.push("state-fail:" + (e && e.message)); }

  return { status: "ACKNOWLEDGED", tenant, customerId, ackBy, steps };
}
