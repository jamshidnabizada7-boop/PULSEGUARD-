# PulseGuard — Build State v2 (overnight session)
*Read this first when resuming. Companion: START-HERE.md on Desktop.*

## IDs (authoritative)
- Org: `personal_dc05aac8b2c7b361ba84` (name "Hackathon Batch 13 Aryan" — rename blocked, name derived from verified domain; leave as is)
- Tenants: ALPHA `1d599802-f9ad-4d62-830a-e66854c108c3` (Acme, #pulseguard-alpha) · BETA `8d8b6c6c-ec68-454c-99c6-a549b7b7e28b` (Globex, #pulseguard-beta)
- Workflows: risk-engine-v2 **`wf_fe925b124168`** (LIVE, pins+unified fix) · ack-loop `wf_4afb70d49708` · platform-api `wf_bf65ee4595f7` (live) · bootstrap `wf_1cfc55bdc0cd` · risk-engine v1 `wf_19ea1eca8222` (superseded)
- Widget: **`wgt_fa0d339f81d4`** "PulseGuard Integrations" (APP type, hubspot+slack, both workflows, ACTIVE)
- Connections (all ACTIVE): HubSpot+Slack × both tenants (ucl: composite ids in workflow CONNECTION_MAP)

## Publish semantics (learned the hard way)
- createWorkflow → v1 DRAFT, not executable (409 WORKFLOW_NOT_PUBLISHED)
- editWorkflowCode → self-publishes (published:true) but takes **~60-150s propagation**; subsequent edits create dev versions that DO NOT go live automatically
- Live deploy of a dev version needs `deployWorkflowVersion` = Fastn Workspace connector action (reachable only via workflow code or executeAction+UUID)
- executeAction needs action UUIDs (get from a workflow manifest that references the action; publishWorkflow UUID = `70d789c8-3236-41fc-a775-60aa327da094`)
- getWorkflow does NOT resolve slugs — use listWorkflows
- executeWorkflow cannot pass headers (no x-end-org-id/x-installation-id!) → tenant connections unreachable from MCP-driven execution (bug report #2)

## THE ONE BLOCKER LEFT
Workflow executes with org end-org context → tenant connections (ucl:*:1d599802.../8d8b6c6c...) don't resolve → Slack/CRM writes fail. Solutions in order:
1. **User clicks** the fastnPlatform OAuth URL (below) → org-level Fastn Workspace connection → platform-api workflow can deploy + create WEBHOOK TRIGGERS (`createWebhookTrigger` POST /api/v1/webhooks) → trigger URLs carry tenant context → full E2E
2. Then create webhook triggers for both tenants bound to wf_fe925b124168 / wf_4afb70d49708, and point the host app at those URLs
3. Alternatively Fastn support fixes API keys (bug #1) → host app calls execute endpoint with x-end-org-id directly
- fastnPlatform connect URL (minted ~05:15, 15-min validity — REGENERATE via initiateOauthConnection connectorId=770f8e5d-d218-423f-9ed4-998b7165f092 authMethodId=3769fc44-0dc3-4949-b3fc-00b5a0847ab3)

## Verified working
- fastn.db (table pulseguard_metrics created, rows written) · fastn.state dedupe (DEDUPLICATED proven) · workflow execute end-to-end · error handling/steps diagnostics · tenant channel routing in code · widget create
- Host app: see Desktop/PulseGuard/pulseguard-app (Next.js 14, plain CSS dark theme, /api/telemetry /api/ack /api/embed-token, tenant switcher)

## Morning checklist (user)
1. Regenerate + click fastnPlatform OAuth URL (above args) → org-level connection
2. Then agent: create 2 webhook triggers (createWebhookTrigger via platform-api workflow), wire host app, run E2E both tenants, record video
3. HubSpot: stop Gmail sync (still pending!), delete junk companies before demo recording
4. Bring CNIC. Fill both forms on-site. Report org name as "Hackathon Batch 13 Aryan (hackathon-aryan)"

## Tooling
- `.pg-call.mjs` — MCP caller: `node .pg-call.mjs '{"label":"x","tool":"toolName","args":{...}}'` (gate-cleared session; env PG_TAIL for slow calls)
- `.pg-tools-full.json` — all 117 tool schemas · `.pg-state.md` — this file
- Workflow code of record: Desktop/PulseGuard/fastn/*.js (pushed to GitHub)
