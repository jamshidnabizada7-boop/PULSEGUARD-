# Demo Video Script — 2:30 (record after the E2E loop is green)

**Rules from the organizers:** short and point-to-point; 200+ submissions get skimmed.
Every segment below maps to a scoring criterion. Screen recording + voiceover.

## Shot list

| Time | On screen | Say (verbatim-ish) |
|---|---|---|
| 0:00–0:20 | Slide: "SaaS churn is silent" + a churn graph | "Customers rarely cancel out of nowhere — usage fades weeks earlier. That signal dies inside analytics dashboards, while Customer Success lives in the CRM and Slack. Bridging that gap is weeks of custom integration work." |
| 0:20–0:40 | **PulseGrid Analytics dashboard** (your product): account table, health sparklines, risk badges | "This is PulseGrid Analytics — a B2B SaaS product. Its retention engine, PulseGuard, is powered by Fastn and embedded in minutes — not built." |
| 0:40–1:00 | **Integrations page** with the Fastn widget embedded; connect HubSpot + Slack; switch tenant Alpha → Beta (isolated connections and channels) | "Each customer connects their own CRM and messaging through the embedded Fastn widget — full multi-tenancy. Tenant Alpha talks to HubSpot and posts to their own Slack channel. Tenant Beta is fully isolated." |
| 1:00–1:35 | Click **Simulate anomaly** → Slack card lands in #pulseguard-alpha → open HubSpot: risk note on Acme's timeline | "Watch: usage drops 52 percent. Fastn's workflow enriches the account through the Unified CRM API, writes a churn-risk diagnosis onto the CRM timeline, and alerts the right channel — in seconds, with a full execution trace." |
| 1:35–1:55 | Click **Acknowledge** in the app → second CRM note appears → dashboard badge flips to ACKNOWLEDGED | "And it's a closed loop: when CS acknowledges the risk, a second Fastn workflow updates the CRM and the dashboard. Not just alerting — actuated retention." |
| 1:55–2:15 | **The agent build proof**: ZCode terminal + Antigravity, MCP session calling `fastnPlatform__createWorkflow`, `executeWorkflow` | "Every piece of this backend was built by AI agents through Fastn's MCP gateway — 117 platform tools, governed and audited. The workflow you saw was created, tested, and deployed by an agent, not hand-coded." |
| 2:15–2:30 | Fastn **Activity → Executions** table: Completed runs, durations | "Every step runs on Fastn's governed runtime — observable, retryable, multi-tenant by design. PulseGuard: from telemetry to retained customers, on Fastn." |

## Recording checklist
- [ ] 1920×1080, browser zoom 110%, dark dashboard theme
- [ ] Pre-seed: Acme healthy + risky rows visible; Slack #pulseguard-alpha open in second window
- [ ] HubSpot company timeline (Acme) ready in third window; notifications OFF
- [ ] Do the Simulate → Slack → HubSpot reveal in ONE continuous take (the money shot)
- [ ] Upload unlisted YouTube/Loom; add the link to the submission form FIRST
