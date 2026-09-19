# PulseGuard — Current Working State (handoff for any AI agent)
*Updated 2026-09-19 ~11:15 AM PKT. Read this fully before touching anything.*

## Locations
- **Project repo (the deliverable)**: `C:\Users\Farah Naz\Desktop\PulseGuard` — git repo, push to https://github.com/jamshidnabizada7-boop/PULSEGUARD-.git (credentials already stored in Git Credential Manager; user.name = jamshidnabizada7-boop)
- **Agent tooling (this workspace)**: `C:\Users\Farah Naz\.zcode\workspace\default`
  - `.pg-call.mjs` — MCP caller: `node .pg-call.mjs '{"label":"x","tool":"<toolName>","args":{...}}'` (env `PG_TAIL=45000` for slow calls). Opens a gate-cleared MCP session (it calls `skill {"slug":"gateway"}` first — REQUIRED).
  - `.pg-tools-full.json` — all 117 gateway tools with schemas
  - `.pg-state.md` — earlier state ledger (this file supersedes it)
  - `.agents/skills/` — installed fastn skills (integration_builder + refs, workflow_verifier, unified_api, gateway)
- **Fastn dashboard**: https://app.fastn.dev (user: jamshidnabizada7@gmail.com)
- **Platform REST host**: https://live.fastn.ai · MCP gateway: https://mcp.fastn.dev (via mcp-remote; OAuth token cached in `C:\Users\Farah Naz\.mcp-auth\`)

## Verified WORKING right now
- **Slack card DELIVERED** to `#pulseguard-alpha` (Fastn app posted the full churn-risk card with Acknowledge button — screenshot evidence 2026-09-19 11:09 AM PKT). Required `/invite @Fastn` in the channels — DONE for alpha AND beta.
- HubSpot `searchCompanies` via tenant connection (found Acme Corp id **347506893507**)
- `fastn.db` (`pulseguard_metrics` table, rows), `fastn.state` dedupe (30-min window keyed on tenant+customer+dropPct)
- Tenant routing: Test panel sends `{"x-end-org-id":"1d599802-f9ad-4d62-830a-e66854c108c3"}` → runs against Tenant-Alpha connections. **Test panel runs ALWAYS use the latest dev code** (deploy gap only affects executeWorkflow/trigger paths).

## IDs (authoritative)
- Org: `personal_dc05aac8b2c7b361ba84` (name "Hackathon Batch 13 Aryan" — rename impossible on free plan, name derives from verified domain; leave as is)
- Tenant ALPHA: `1d599802-f9ad-4d62-830a-e66854c108c3` (Acme Corp, #pulseguard-alpha)
- Tenant BETA: `8d8b6c6c-ec68-454c-99c6-a549b7b7e28b` (Globex Exports, #pulseguard-beta)
- Risk Engine (THE live one): `wf_fe925b124168` slug `pulseguard-risk-engine-v2` — dashboard "Latest v3"
- Ack Loop: `wf_4afb70d49708` · Platform API util: `wf_bf65ee4595f7` (live) · Bootstrap: `wf_1cfc55bdc0cd` · Risk v1 (superseded): `wf_19ea1eca8222`
- Widget: `wgt_fa0d339f81d4` "PulseGuard Integrations" (APP type, hubspot+slack, both workflows)
- Installations: ALPHA `inst_001013f1daf0` · BETA `inst_5cc2e6ec7487` (status active, config: riskThreshold 40/35, slackChannel set)
- HubSpot: Acme Corp `347506893507` · Globex Exports (find via searchCompanies query "globex")
- Webhook config (unused): `cwc_e493523badca` on HTTP API connector `b77f2010-181e-4a97-8094-4d3c513322d9`
- HubSpot authMethod `45e0c3c0-fb8b-48c8-938b-b257bb954123` · Slack authMethod `7195748d-a02f-49e4-9e76-7e48d76a3b3c` · Fastn Workspace connector `770f8e5d-d218-423f-9ed4-998b7165f092` authMethod `3769fc44-0dc3-4949-b3fc-00b5a0847ab3`
- publishWorkflow action UUID: `70d789c8-3236-41fc-a775-60aa327da094`

## CRITICAL platform gotchas (learned by fire)
1. **Publish/deploy semantics**: `createWorkflow` → v1 draft, NOT executable (409). `editWorkflowCode` publishes the FIRST edit (with 60–150s propagation lag) — after that, further edits bump `devVersion` but DO NOT go live. Test-panel runs use the latest dev code regardless. To deploy dev → live: either fresh-create a new slug + first-edit (proven), or `deployWorkflowVersion` via the Fastn Workspace connector (BROKEN — bug #7: every action URL template is `"{{auth.baseUrl}}"` but the OAuth flow never populates baseUrl → "Action URL needs credential baseUrl"). `executeAction` requires action UUIDs (not slugs) — get them from a workflow manifest that references the action. `listWorkflows` works; `getWorkflow` does NOT resolve slugs.
2. **Rate limits**: ~15 createWorkflow/hour → 429 "Fastn Workspace is rate-limiting requests"; did not clear in 25 min of backoff. Use edits, not recreates.
3. **executeWorkflow MCP tool cannot pass headers** (no x-end-org-id/x-installation-id) → tenant connections unreachable from agent-driven execution. Test panel CAN pass headers. Bug reported.
4. **Gateway flat tools broken**: `whoami`, `search_tools`, `list_connectors` (bare) → `-32603 configDb: unavailable on the data plane`. `fastnPlatform__*` tools all work. `manage_connections` also broken.
5. **Dedupe**: same tenant+customerId+usageDropPct within 30 min → `DEDUPLICATED` early-return. Bump the drop % to re-fire.
6. All 8 platform bugs with evidence: `Desktop/PulseGuard/docs/bug-reports.md` (submit in feedback form for bonus points).

## REMAINING WORK (in order)
1. **Verify HubSpot note shape**: last run showed 9 steps/6 OK/3 ERR — need the `steps[]` array from the user's Test panel output to see which note shape succeeded (`direct-createNote-ok[props+assoc279|flat-body-company|props-only]`). If ALL 3 shapes failed, the captured error bodies are in the steps — fix accordingly. (Slack + search now proven.)
2. **Ack button URL**: currently `https://pulseguard.local/api/ack?...` (placeholder → DNS error, already clicked once). Fix options: (a) deploy dashboard, then editWorkflowCode replacing `ackBaseUrl` fallback with the Vercel URL; or (b) point it at the local dev server URL if demoing locally. The ack flow itself (`wf_4afb70d49708`) is live and works when invoked with {tenant, customerId, ackBy}.
3. **Tenant-Beta E2E**: Test panel with headers `{"x-end-org-id":"8d8b6c6c-ec68-454c-99c6-a549b7b7e28b"}`, customerId = Globex's HubSpot id (search "Globex" first), usageDropPct 45 (beta threshold 35). Card must land in `#pulseguard-beta`.
4. **User tasks**: Vercel deploy of `pulseguard-app/` (npm install already done locally; build passes), record video (script: `docs/demo-video-script.md`), HubSpot Gmail-sync cleanup + junk-company deletion, CNIC for NUST, fill both forms on-site.
5. Optional: submit bug reports #1–#8.

## Workflow code of record
`Desktop/PulseGuard/fastn/pulseguard-risk-engine.js` — NOTE: the LIVE code (wf_fe925b124168) has drifted slightly ahead of this file: live now has `orgId: "managed"`, UUID-keyed CONNECTION_MAP aliases, note-shape fallback chain, Slack channel resolution via listConversationsList. Sync the file from `getWorkflow` before further edits (use `.pg-call.mjs` + getWorkflow, extract `code`).
