# PulseGuard 🛡️ — Autonomous Churn Radar with a Closed Loop

**Team hackathon-aryan · Build With Fastn Hackathon**

**Live Vercel Deployment**: [https://pulseguard-app-nu.vercel.app](https://pulseguard-app-nu.vercel.app)
- **Tenant Alpha (Acme Corp)**: [https://pulseguard-app-nu.vercel.app/?tenant=tenant-alpha](https://pulseguard-app-nu.vercel.app/?tenant=tenant-alpha)
- **Tenant Beta (Globex Exports)**: [https://pulseguard-app-nu.vercel.app/?tenant=tenant-beta](https://pulseguard-app-nu.vercel.app/?tenant=tenant-beta)
- **Integrations Panel (Fastn Widget)**: [https://pulseguard-app-nu.vercel.app/integrations](https://pulseguard-app-nu.vercel.app/integrations)
- **Execution Audit (Fastn Activity)**: [https://pulseguard-app-nu.vercel.app/runs](https://pulseguard-app-nu.vercel.app/runs)

PulseGuard watches customer health telemetry, predicts churn risk, enriches the account from
the CRM via Fastn Unified APIs, drops a risk diagnosis on the CRM timeline, fires an
interactive Slack alert to the right tenant channel — and **closes the loop** when CS
acknowledges the risk (CRM updated again, state recorded, dashboard reflects it).

Built end-to-end through the **Fastn MCP gateway** (117 platform tools driven by AI agents).

## Folder map

| Path | What it is |
|---|---|
| `START-HERE.md` | Morning read: status, what to check, what's left |
| `docs/PULSEGUARD-PLAN.md` | The full implementation plan (architecture, code, scripts) |
| `docs/hackathon-analysis.md` | Scoring analysis from the onboarding session |
| `docs/bug-reports.md` | Evidence-backed platform bugs found while building (bonus points) |
| `docs/verification-report.md` | Phase-4 verification evidence (executions, read-backs) |
| `docs/submission.md` | Final submission copy for the form |
| `docs/demo-video-script.md` | The 2:30 shot-by-shot video script |
| `fastn/` | Exact workflow code deployed to Fastn (risk engine, ack loop, settings API) |
| `pulseguard-app/` | The host SaaS dashboard (Next.js 14) — deployable to Vercel |

## The system in one diagram

```
PulseGrid Analytics (Next.js, Vercel)
  ├── Dashboard: account health, risk badges, tenant switcher, "Simulate anomaly"
  ├── Integrations: Fastn widget (server-minted embed tokens)
  └── Runs: live Fastn execution log
        │  telemetry POST (real HTTP, real tenant headers)
        ▼
Fastn workspace ── pulseguard-risk-engine (Standard tier)
  ├─ fastn.db: per-tenant baselines (pulseguard_metrics)
  ├─ fastn.unified.crm.getAccount → enrich from customer's own CRM
  ├─ fastn.unified.crm.createNote → churn diagnosis on the CRM timeline
  ├─ fastn.connector.slack.postMessage → interactive alert card
  └─ Fastn ── pulseguard-ack-loop (Instant tier)
        CS acknowledges → webhook → DB update → CRM follow-up note
```

## Status

See `START-HERE.md` — updated automatically as the build progresses.
