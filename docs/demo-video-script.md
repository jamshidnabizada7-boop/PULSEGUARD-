# Demo Video Script — 2:00 (hard cap for the submission)

**Rules from the organizers:** short and point-to-point; 200+ submissions get skimmed.
"A good submission is a small video presenting something big." Every segment below maps
to a scoring criterion: Creativity 30 · Implementation 20 · MCP usage 20–40 · Submission ~30.

Screen recording (1920×1080) + voiceover. The chat acknowledgment in shot 4 is the
centerpiece — it is a *real* Fastn workflow executed from an AI chat, live.

## Shot list

| Time | On screen | Say (verbatim-ish) |
|---|---|---|
| 0:00–0:10 | Slide: "SaaS churn is silent" + a falling usage graph | "Customers rarely cancel out of nowhere — usage fades weeks earlier. PulseGuard catches that moment and acts on it, end to end." |
| 0:10–0:30 | **PulseGrid dashboard**: welcome strip, KPI band, Monitored accounts table with the red NEEDS ATTENTION row | "This is PulseGrid Analytics — a B2B SaaS product whose retention engine, PulseGuard, runs on Fastn. Watch the one account that needs attention: usage fell sixteen percent this week." |
| 0:30–0:55 | Click **Simulate Anomaly** → the row narrates live ("Diagnosing… Writing the CRM note… Alerting #pulseguard-alpha") → cut to Slack: interactive card lands in #pulseguard-alpha | "One click sends real telemetry into Fastn. The risk engine diagnoses the account, writes a churn note onto the CRM timeline, and alerts the right channel — in seconds, per tenant." |
| 0:55–1:10 | HubSpot: Acme Corp company timeline — the automated diagnosis note | "There's the diagnosis on the customer's CRM timeline. No one wrote it — Fastn's Unified CRM API did." |
| 1:10–1:40 | **The AI assistant (money shot)**: ask "Which account should I contact first?" → LLM answer with live data → click "Acknowledge the Acme Corp risk" → row flashes, badge flips to HANDLED, KPI counts down to zero | "And it's a closed loop with an AI on top. The assistant reads live data, prioritises my outreach — and acknowledges the risk *from chat*. That click executes a real Fastn workflow: CRM updated, alert cleared, dashboard synced." |
| 1:40–1:50 | Tenant switcher → Tenant Beta (Globex) — different data, different channel; quick Integrations glance: tokenized Fastn embed | "Every customer is an isolated workspace — own CRM, own Slack channel, zero leakage — connected in minutes through the embedded Fastn widget." |
| 1:50–2:00 | Fastn **Activity → Executions** (or our Activity page traces) | "Every step ran on Fastn's governed runtime — and the backend itself was built by AI agents through Fastn's MCP gateway. PulseGuard: from telemetry to retained customers." |

## Why this order wins points
- **0:30–1:10 is Implementation** — one continuous take, nothing faked.
- **1:10–1:40 is Creativity + MCP** — an AI assistant that *acts* through governed
  workflows, not just alerts. Say the words "real Fastn workflow execution from chat".
- **1:40–1:50 is multi-tenant isolation** — the thing judges can't see anywhere else.

## Recording checklist
- [ ] Vercel deployment has env vars set (FASTN_API_KEY, FASTN_ORG_ID, FASTN_HOST, FASTN_APP_URL, LLM_API_KEY, LLM_MODEL, APP_BASE_URL) — otherwise the assistant runs in fallback mode
- [ ] 1920×1080, browser zoom 110%, dark theme; close the chat dock before shot 2, reopen for shot 4
- [ ] Pre-seed: Acme healthy + risky rows visible (localStorage `pulseguard_runs` cleared once so Activity starts clean, then one warm-up run)
- [ ] Slack #pulseguard-alpha open in second window; HubSpot Acme timeline in third; notifications OFF
- [ ] Shots 0:30–1:40 in ONE continuous take (simulate → Slack → HubSpot → chat acknowledge)
- [ ] First-visit welcome strip: dismiss on camera in shot 2 (it orients the viewer) — or clear localStorage before recording so it appears
- [ ] Upload unlisted YouTube/Loom; add the link to the submission form FIRST
