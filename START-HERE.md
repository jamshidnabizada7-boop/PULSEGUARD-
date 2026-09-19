# 🌅 START HERE — Morning of the Hackathon

**It's built. One click from you finishes the wiring.** Read top to bottom, ~4 minutes.

## What exists right now (all built through Fastn MCP overnight)

| Piece | Status |
|---|---|
| **Risk Engine workflow** (`wf_fe925b124168`) | ✅ LIVE — dedupe → risk eval → `fastn.db` baselines → CRM note → Slack card |
| **Ack Loop workflow** (`wf_4afb70d49708`) | ✅ LIVE — closes the loop (DB + CRM note) |
| **Platform API utility** (`wf_bf65ee4595f7`) | ✅ LIVE — deploys/publishes/tests workflows programmatically |
| **Widget "PulseGuard Integrations"** (`wgt_fa0d339f81d4`) | ✅ ACTIVE — HubSpot + Slack, both workflows bound |
| **4 connections** | ✅ ACTIVE — HubSpot + Slack × Tenant-Alpha + Tenant-Beta |
| **Host dashboard** (`pulseguard-app/`) | ✅ LIVE on Vercel (`https://pulseguard-app-nu.vercel.app`) |
| **Proof runs** | ✅ Engine executed end-to-end live: DB writes ✅, dedupe ✅, tenant routing ✅ |

## ⚡ Your first action (2 minutes) — unlocks the last wiring

The workflow engine runs, but Fastn blocks tenant-scoped connections during agent-driven
execution unless an **org-level Fastn Workspace connection** exists. Fix:

1. Run in the PulseGuard folder terminal (or ask the agent):
   `node .pg-call.mjs '{"label":"genu","tool":"fastnPlatform__initiateOauthConnection","args":{"connectorId":"770f8e5d-d218-423f-9ed4-998b7165f092","authMethodId":"3769fc44-0dc3-4949-b3fc-00b5a0847ab3","source":"mcp","connectionName":"fastn-workspace-org"}}'`
   *(regenerates a fresh link — links expire in 15 min)*
2. Open the URL it prints → authorize with your Fastn login.
3. Tell the agent: **"workspace connected"** — it creates the webhook triggers, runs the
   full two-tenant E2E (real Slack messages + real HubSpot notes), and you record the video.

## Then (order matters)

1. **HubSpot cleanup (5 min)** — Settings → Integrations → disconnect the Gmail email sync
   (it imported ~2,000 emails / 20 junk companies). Keep Acme Corp + Globex Exports.
2. **Deploy the dashboard** — ✅ DEPLOYED & LIVE: [https://pulseguard-app-nu.vercel.app](https://pulseguard-app-nu.vercel.app/?tenant=tenant-alpha).
3. **Record the video (30 min)** — script ready: `docs/demo-video-script.md` (2:30, shot-by-shot).
4. **Pack**: original **CNIC** (or Form B). Both forms get filled on-site.

## Where everything lives

- `README.md` — project overview
- `docs/PULSEGUARD-PLAN.md` — full plan · `docs/hackathon-analysis.md` — scoring strategy
- `docs/bug-reports.md` — **4 evidence-backed platform bugs** (bonus points — file these!)
- `docs/verification-report.md` — run evidence from the overnight build
- `fastn/` — the exact workflow code live in Fastn (also visible in the dashboard's Workflows tab)
- GitHub: https://github.com/jamshidnabizada7-boop/PULSEGUARD- (pushed)

## If short on time — the demo minimum

Dashboard (local `npm run dev` is fine) → Simulate anomaly → Slack card lands in
#pulseguard-alpha → HubSpot timeline note on Acme → click Acknowledge → CRM note #2 →
Runs page shows executions. That alone demonstrates: MCP-built, multi-tenant, unified CRM,
webhooks, DB, widget, closed loop.
