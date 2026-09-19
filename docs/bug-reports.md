# Fastn Platform — Bug Reports & Developer Feedback
*Team hackathon-aryan · Build With Fastn Hackathon · all items reproduced and evidenced during this hackathon*

Submit via the mandatory feedback form. Each item was hit while building a real integration
through the MCP gateway — repro steps and evidence are included so engineering can act fast.

---

## 1. API keys are rejected by both the MCP gateway and the platform REST API (org-wide)

**Severity: high.** Freshly minted keys (Settings → API keys) fail everywhere we tried, on a
workspace created the same day.

- **MCP gateway** `https://mcp.fastn.dev` — MCP `initialize` request returns
  `401 {"error":"unauthorized"}` with `WWW-Authenticate: Bearer resource_metadata=...`.
  Tried: live key `fsk_live_KRA4…` and test key `fsk_test_mbQc…`, each with
  `Authorization: Bearer`, plus `x-api-key`, `x-fastn-api-key`, `fastn-api-key`,
  `x-auth-token`, raw token without `Bearer`, and `?api_key=` / `?apiKey=` / `?token=`
  query params — **all 401**. (Docs, `build/mcp-gateway`: "authenticate with an API key …
  `Authorization: Bearer fsk_live_<your-key>`" — the documented path is dead.)
- **Platform REST** `https://live.fastn.ai/api/v1/embed/token` —
  `401 {"error":"The resource does not exist, or you do not have access."}` with both keys,
  and with `x-org-id` set to the org id (`personal_dc05…`), the org slug, or omitted.
- **Impact**: server-side embed-token minting (the documented production pattern for widgets)
  is impossible; agents' REST calls fall back to interactive OAuth only.
- **Note**: OAuth works flawlessly — the gateway, its skills, and 117 platform tools all
  function. Only key-based auth is broken.

## 2. Workflow executions cannot receive tenant context from agent tooling

**Severity: high for multi-tenant builds.**

- `executeWorkflow` (POST /api/v1/workflows/{id}/execute via MCP) accepts only `{id, input}` —
  there is **no way to pass `x-end-org-id` / `x-installation-id` headers**, so a multi-tenant
  workflow executed by an agent always resolves connections against the caller's own org:
  `No active connection for connector "slack" and end-org "personal_dc05…"`. The error text
  itself suggests "pass x-installation-id" — which the same tool cannot do.
- The HTTP execute endpoint accepts headers, but is unusable for agents while bug #1 blocks
  key-based auth.
- **Suggestion**: accept optional `headers` (or `endOrgId`) on `executeWorkflow`, and/or let
  `new Fastn({ connectors: { … } })` connection pins override the end-org dimension
  (a pinned connectionId whose endOrg ≠ execution end-org is currently ignored).

## 3. Publish/Deploy semantics are opaque and slow to propagate

- `createWorkflow` → "version 1" but `409 WORKFLOW_NOT_PUBLISHED` on execute.
- `editWorkflowCode` returns `published: true`, yet the workflow stays unexecutable for
  **60–150 seconds**, and later edits bump `devVersion` **without** going live (executions
  keep running the stale published version — we shipped stale-code runs three times before
  mapping the semantics).
- There is no MCP-exposed `publishWorkflow`/`deployWorkflowVersion`; these exist only as
  Fastn Workspace *connector actions* whose action IDs are not listed by
  `getConnectorMethods` (slug-based `executeAction` 404s: "Action not found"), so agents
  cannot reach them without a manifest trick.
- **Suggestion**: expose publish/deploy as first-class MCP tools, return the live version id
  in the publish response, and make `executeWorkflow` deterministic post-publish.

## 4. Several gateway tools fail with a data-plane error

`whoami`, `search_tools`, and `list_connectors` (the gateway's flat agent tools) all fail with
`-32603: "configDb: unavailable on the data plane (config-free). This code path must run on
the control plane."` — reproducible across fresh sessions, before and after the gateway
playbook read. The `fastnPlatform__*` tool family works fine, but `whoami` is mandatory
Step 0 of the gateway's own integration_builder skill, and `search_tools` is the documented
discovery route for the 160+ connected-app tools.

## 5. Docs inconsistency: `fastn.connector` vs `fastn.connectors`

The workflow-runtime documentation flip-flops between `fastn.connector.<slug>.<action>(…)`
and `fastn.connectors` (the docs flag it themselves). Also `fastn.state.set` supports no TTL
option while `fastn.cache.set` does — worth documenting side by side, since picking the wrong
one silently changes persistence semantics.

## 6. Organisation display name is not editable on free plan

The Organisation settings Name field is derived from the verified domain (gmail.com) and
cannot be changed, which breaks the hackathon's mandated `hackathon-<teamname>` org-naming
pattern for participants without a custom domain. (Workaround used: hackathon batch + team
name baked into the auto-generated org name at signup.)

---

*Everything above was reproduced on 2026-09-18/19 against mcp.fastn.dev / live.fastn.ai /
connect.fastn.dev with curl transcripts and MCP session logs available on request.*

---

## 7. "Fastn Workspace" self-connector is unusable (missing baseUrl credential)

`getAction` shows every platform action's URL template is `"{{auth.baseUrl}}" + relative path`,
but the connector's OAuth flow (Keycloak) never populates a `baseUrl` credential — every action
call fails with: *"Action URL needs credential "baseUrl", which this connection does not carry."*
This blocks agents from `publishWorkflow` / `deployWorkflowVersion` / `createWebhookTrigger` /
`createScheduler` / `testSavedWorkflow` through the connector — the exact operations the MCP
tool surface omits. Reproduced with a freshly authorized org-level connection (2026-09-19).

## 8. createWorkflow rate-limiting with no Retry-After

Under moderate agent usage (~15 createWorkflow calls/hour), the endpoint starts returning
"Fastn Workspace is rate-limiting requests right now" with no `Retry-After` header, and the
limit did not clear within 7 minutes of idle. Fine-grained deploy/publish via MCP tools would
reduce the need to recreate workflows just to ship a code change (see #3).
