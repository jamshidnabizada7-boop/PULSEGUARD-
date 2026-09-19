# PulseGuard — Fastn Hackathon Project Submission

**Project Title**: PulseGuard — Autonomous Churn Radar with Closed-Loop Remediation  
**Team Identity**: `hackathon-aryan` (Fastn Hackathon Batch 13)  
**Fastn Organization ID**: `personal_dc05aac8b2c7b361ba84` (*Hackathon Batch 13 Aryan*)  
**Primary Contact / Builder**: Jamshid Nabizada (`jamshidnabizada7@gmail.com`)  
**GitHub Repository**: [https://github.com/jamshidnabizada7-boop/PULSEGUARD-.git](https://github.com/jamshidnabizada7-boop/PULSEGUARD-.git)  
**Live Production Deployment**: [https://pulseguard-app-nu.vercel.app](https://pulseguard-app-nu.vercel.app)  
**Tenant Alpha Dashboard**: [https://pulseguard-app-nu.vercel.app/?tenant=tenant-alpha](https://pulseguard-app-nu.vercel.app/?tenant=tenant-alpha)  
**Tenant Beta Dashboard**: [https://pulseguard-app-nu.vercel.app/?tenant=tenant-beta](https://pulseguard-app-nu.vercel.app/?tenant=tenant-beta)  
**Submission Date**: September 19, 2026  

---

## 1. Executive Summary & Problem Statement

### The Problem: Silent SaaS Churn
In modern B2B SaaS, customers rarely churn without warning. Engagement, session duration, and feature adoption drop weeks before cancellation. However:
- **Telemetry signal is trapped** inside product analytics tools (Mixpanel, PostHog, internal clickstream databases).
- **Customer Success lives in CRM & Slack** (HubSpot, Salesforce, Slack channels) and has zero real-time visibility into telemetry drops.
- **Traditional solution**: Engineering teams waste 4–6 weeks hand-writing fragile ETL scripts, webhook receivers, CRM API integrations, and alert bots across multiple stacks.

### The Solution: PulseGuard on Fastn
**PulseGuard** transforms customer health monitoring into an autonomous, governed retention loop powered by Fastn:
1. **Governed Telemetry Ingestion**: Product telemetry hits a governed Fastn endpoint carrying tenant context (`x-end-org-id`).
2. **Autonomous Risk Engine**: Fastn evaluates drop velocity against tenant-configured thresholds, deduplicates alerts using `fastn.state`, enriches customer records via Fastn's **Unified CRM API**, writes diagnostic notes to the CRM timeline, and posts interactive Block Kit cards to the tenant's dedicated Slack channel.
3. **Closed-Loop Actuation**: When Customer Success clicks **Acknowledge Risk** in Slack or the dashboard, a second Fastn workflow updates the CRM timeline, adjusts customer status, and flips the health state across the application.
4. **Embedded Integrations**: End-customers configure their own HubSpot and Slack integrations directly inside the product via the embedded Fastn Widget (`wgt_fa0d339f81d4`).
5. **100% Agent-Built**: Built end-to-end through the Fastn MCP Remote Gateway (`mcp.fastn.dev`) using 117 platform tools.

---

## 2. Architecture & Platform Components

### High-Level Topology
```
Product Telemetry Event (Usage drop -52%)
                 │
                 ▼
     [ Fastn Governed Runtime ]
     x-end-org-id: Tenant-Alpha / Tenant-Beta
                 │
  ┌──────────────┴──────────────┐
  │  Fastn State Deduplication   │ (30-min idempotency window via fastn.state)
  └──────────────┬──────────────┘
                 │
  ┌──────────────┴──────────────┐
  │    Fastn Unified CRM API    │ (Enrichment via searchCompanies)
  └──────────────┬──────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
 [ HubSpot Timeline ]   [ Slack Alert Card ]
 Note: Churn Risk       #pulseguard-alpha / #pulseguard-beta
 Diagnosis Appended     Interactive "Acknowledge" Button
                                │
                                ▼
                   [ Fastn Ack-Loop Workflow ]
                   Flipping state across CRM & PulseGrid
```

### Key Platform Assets & Authoritative IDs

| Resource | ID / Identifier | Description & Role |
|---|---|---|
| **Fastn Organization** | `personal_dc05aac8b2c7b361ba84` | Organization: *Hackathon Batch 13 Aryan* |
| **Tenant Alpha** | `1d599802-f9ad-4d62-830a-e66854c108c3` | Acme Corp · Connected to HubSpot (ID: `347506893507`) & Slack (`#pulseguard-alpha`) |
| **Tenant Beta** | `8d8b6c6c-ec68-454c-99c6-a549b7b7e28b` | Globex Exports · Connected to HubSpot & Slack (`#pulseguard-beta`) |
| **Risk Engine Workflow** | `wf_fe925b124168` (`pulseguard-risk-engine-v2`) | Core detection, enrichment, CRM timeline writing, and Slack alerting |
| **Ack Loop Workflow** | `wf_4afb70d49708` (`pulseguard-ack-loop`) | Closed-loop actuation updating CRM and dashboard upon CS acknowledgement |
| **Embedded Widget** | `wgt_fa0d339f81d4` (*PulseGuard Integrations*) | Embedded APP widget exposing HubSpot + Slack configuration & risk threshold settings |
| **Alpha Installation** | `inst_dcafc09c2f07` | Active tenant configuration: riskThreshold: 40%, slackChannel: `#pulseguard-alpha`, ackBaseUrl configured |
| **Beta Installation** | `inst_6e346d508e28` | Active tenant configuration: riskThreshold: 35%, slackChannel: `#pulseguard-beta`, ackBaseUrl configured |
| **HubSpot Connector** | `9036a742-6baa-4c72-be3c-3789b34d6f9b` | Auth method `45e0c3c0-fb8b-48c8-938b-b257bb954123` |
| **Slack Connector** | `8de5d696-5289-4c9c-ade4-de918d019d06` | Auth method `7195748d-a02f-49e4-9e76-7e48d76a3b3c` |
| **MCP Remote Gateway** | `https://mcp.fastn.dev` | 117 platform tools accessed via gate-cleared MCP sessions |

---

## 3. Multi-Tenancy & Data Isolation

PulseGuard implements true enterprise multi-tenancy:
- **No Shared Credentials**: Every tenant connects their own HubSpot portal and Slack workspace via Fastn's managed OAuth connections.
- **Tenant Context Propagation**: Telemetry events carry the `x-end-org-id` header corresponding to the active tenant.
- **Strict Boundary Enforcement**:
  - Telemetry from Tenant Alpha (`1d599802-f9ad-4d62-830a-e66854c108c3`, Acme Corp) evaluates against Alpha's 40% threshold and posts strictly to `#pulseguard-alpha`.
  - Telemetry from Tenant Beta (`8d8b6c6c-ec68-454c-99c6-a549b7b7e28b`, Globex Exports) evaluates against Beta's 35% threshold and posts strictly to `#pulseguard-beta`.
  - No cross-tenant notification leakage or data contamination is possible.

---

## 4. Frontend Application: PulseGrid Analytics

The frontend is a production-grade Next.js 14 application situated in `pulseguard-app`, designed
Cursor-style (flat near-black canvas, sidebar shell, plain-language UX) so a first-time viewer
understands it in seconds:
1. **Dynamic Customer Health Dashboard (`/`)**:
   - KPI stat band (accounts at risk, healthy, revenue protected, avg health) with count-up animations.
   - Monitored-accounts table: 7-day health sparklines, week-over-week delta chips, and plain-language
     status badges (`NEEDS ATTENTION`, `HANDLED`, `HEALTHY`) — color is reserved for meaning.
   - **Simulate Anomaly** dispatches real telemetry to Fastn (`/api/telemetry`, simulated-dispatch
     fallback guarantees demo reliability) while the row narrates the live workflow steps
     ("Diagnosing… → Writing the CRM note… → Alerting #pulseguard-alpha").
   - Acknowledge Risk from the row → `/api/ack` → CRM updated, badge flips.
   - Every technical term carries a clickable ⓘ that opens the assistant pre-asked.
2. **PulseGuard Assistant (every page, docked right panel)**:
   - LLM-powered (OpenAI-compatible endpoint, server-side key) with the full screen guide and live
     tenant context injected; deterministic built-in responder as automatic fallback.
   - **Acts, not just chats**: "Acknowledge the Acme Corp risk" executes the real
     `pulseguard-ack-loop` Fastn workflow via `/api/ack` and syncs the dashboard live.
3. **Embedded Integrations Panel (`/integrations`)**:
   - Governed Widget view for HubSpot + Slack + threshold settings.
   - **Tokenized raw embed**: `/api/embed-token` mints 8-hour tenant-scoped tokens server-side
     (Fastn requires the tenant's end-org as `x-org-id`; response unwrapped from its `data` envelope)
     and the raw platform iframe loads signed-in — with a graceful, professional fallback if minting fails.
4. **Execution Runs & Activity Audit (`/runs`)**:
   - Auto-refreshes every 5 seconds; human outcome badges (Alert sent / Duplicate blocked / Risk handled
     / All good) with the raw Fastn status preserved as tooltips.
   - Run traces rendered as a connected stepper (dot → line → dot) proving end-to-end execution.
   - Tenant filter (All / Alpha / Beta) and a collapsed "Platform details" section holding every
     technical ID so end users never see a UUID unless they go looking.

---

## 5. Built 100% via Fastn MCP Gateway

PulseGuard's backend workflows, widget configurations, and tenant installations were not created manually via UI clicking. They were built and deployed by AI agents through Fastn's MCP Remote Gateway (`https://mcp.fastn.dev`):
- **Agent caller tooling**: `Desktop/PulseGuard/agent-tooling/mcp-call.mjs`
- **MCP Configuration**: `.agents/mcp_config.json` and global `~/.gemini/config/mcp_config.json` configured with `serverUrl: https://mcp.fastn.dev`.
- **Governed Tool Usage**:
  - `skill {"slug":"gateway"}` (Session gate-clearing playbook)
  - `fastnPlatform__createWorkflow` & `fastnPlatform__editWorkflowCode`
  - `fastnPlatform__listConnectors` & `fastnPlatform__getConnectorMethods`
  - `fastnPlatform__createWidget` & `fastnPlatform__listWidgets`
  - `fastnPlatform__executeWorkflow` & `fastnPlatform__listWorkflowExecutions`
  - Complete build history preserved in `docs/build-state.md`.

---

## 6. Comprehensive Fastn Bug Reports & Feedback

During the development and testing of PulseGuard over the Fastn platform, our team performed rigorous testing and identified **8 concrete platform issues**. Full repro steps, curl logs, and architectural recommendations are documented in `docs/bug-reports.md`:

1. **Bug #1 — API Keys Rejected by Gateway & REST API (Severity: High)**:
   - Freshly minted keys (`fsk_live_...` / `fsk_test_...`) returned 401 across both `mcp.fastn.dev` and `live.fastn.ai/api/v1/embed/token` despite matching documented syntax. (OAuth works, key-based auth blocked).
2. **Bug #2 — Workflow Executions Cannot Receive Tenant Context from Agent Tooling (Severity: High)**:
   - `executeWorkflow` MCP tool only accepts `{id, input}` without header parameters (`x-end-org-id`), preventing agents from executing multi-tenant workflows directly from tooling.
3. **Bug #3 — Publish/Deploy Semantics Opaque with 60–150s Propagation Delay**:
   - `createWorkflow` creates draft v1 (`409 WORKFLOW_NOT_PUBLISHED`). Subsequent edits bump `devVersion` without pushing to live execution unless freshly created or deployed via workspace action.
4. **Bug #4 — Gateway Flat Tools Fail with Data-Plane Error**:
   - `whoami`, `search_tools`, and `list_connectors` fail with `-32603: configDb: unavailable on the data plane`.
5. **Bug #5 — Documentation Inconsistency (`fastn.connector` vs `fastn.connectors`)**:
   - Documentation alternates between singular and plural syntax; `fastn.state.set` lacks documented TTL whereas `fastn.cache.set` supports it.
6. **Bug #6 — Organization Display Name Uneditable on Free Tier**:
   - Org name is locked to verified domain, preventing compliance with hackathon team naming conventions.
7. **Bug #7 — Fastn Workspace Self-Connector Unusable (Missing `baseUrl`)**:
   - Connector action URL templates require `{{auth.baseUrl}}`, which the Keycloak OAuth flow does not populate.
8. **Bug #8 — `createWorkflow` Rate Limiting Without `Retry-After`**:
   - ~15 createWorkflow requests per hour triggered rate limits with no retry header, impeding iterative agent development.

*Submitting these detailed findings provides immediate value to Fastn's core engineering team.*

---

## 7. Demo Video (≤ 2:00 — submission cap)

Final shot-by-shot script lives in [`demo-video-script.md`](demo-video-script.md). Structure:

| Timing | Visual | Rubric |
|---|---|---|
| **0:00 – 0:10** | Problem slide: silent churn | Problem & Value |
| **0:10 – 0:30** | Dashboard: KPI band, red NEEDS ATTENTION row | Application Quality |
| **0:30 – 0:55** | Simulate Anomaly → live row narration → Slack card lands | Fastn Embedding & E2E Workflow |
| **0:55 – 1:10** | HubSpot timeline: automated diagnosis note | Unified CRM API |
| **1:10 – 1:40** | **AI assistant**: prioritise from live data → acknowledge the risk *from chat* → dashboard syncs | Creativity + MCP + Closed Loop |
| **1:40 – 1:50** | Tenant switch → Beta isolation; tokenized Fastn embed | Multi-Tenancy |
| **1:50 – 2:00** | Execution traces + MCP agent-build proof | Governance & Platform |

---

## 8. Verification & Evidence Artifacts

The `evidence/` directory contains complete documentation, execution traces, and verified manifests:
- `evidence/README.md`: Master verification ledger with JSON execution traces and rubric mapping.
- `evidence/01-slack-card-alpha.md` (`01-slack-card-alpha.png`): Verified card delivered to `#pulseguard-alpha` (`C08J8L7C4UG`).
- `evidence/02-slack-card-beta.md` (`02-slack-card-beta.png`): Isolated card delivered to `#pulseguard-beta` (`C08J8L9F7XY`).
- `evidence/03-hubspot-timeline-note.md` (`03-hubspot-timeline-note.png`): Acme Corp timeline note created via Fastn Unified CRM API.
- `evidence/04-fastn-dashboard-workflows.md` (`04-fastn-dashboard-workflows.png`): Workflow dashboard showing `pulseguard-risk-engine-v2` & `pulseguard-ack-loop`.
- `evidence/05-fastn-widget-embedded.md` (`05-fastn-widget-embedded.png`): Embedded Fastn widget (`wgt_fa0d339f81d4`) in `/integrations`.
- `evidence/06-fastn-executions-trace.md` (`06-fastn-executions-trace.png`): Fastn runtime execution log with full step traces.
- `evidence/07-mcp-agent-build-terminal.md` (`07-mcp-agent-build-terminal.png`): MCP session build transcript using 117 platform tools.
- `evidence/08-tenant-beta-isolated-run.md` (`08-tenant-beta-isolated-run.png`): Multi-tenant header validation trace confirming zero cross-tenant leakage.

---

## 9. Local Reproduction Instructions

```bash
# 1. Clone & enter project
git clone https://github.com/jamshidnabizada7-boop/PULSEGUARD-.git
cd PULSEGUARD-/pulseguard-app

# 2. Configure secrets (gitignored)
#    .env.local: FASTN_API_KEY, FASTN_ORG_ID, FASTN_HOST, FASTN_APP_URL,
#                LLM_API_KEY (OpenRouter), LLM_MODEL, APP_BASE_URL

# 3. Build & run production server
npm run build
npm run start
# Open http://localhost:3210
```

1. `/` → dismiss the welcome strip → press **Simulate Anomaly** → watch the row narrate the
   workflow steps and the Slack card land in `#pulseguard-alpha`.
2. Open the **Assistant** (bottom-right) → ask *"Which account needs attention?"* → then
   *"Acknowledge the Acme Corp risk"* → the dashboard syncs live (real Fastn execution).
3. Switch workspace to **Tenant Beta — Globex Exports** in the sidebar → verify isolation.
4. `/integrations` → **Live embed → Raw Platform Iframe** → the tokenized Fastn panel signs in
   automatically; **Activity** → expand **Platform details** for every workflow/widget ID.
