# PulseGuard Evidence & Verification Manifest

**Team**: `hackathon-aryan` (Fastn Hackathon Batch 13)  
**Fastn Org**: `personal_dc05aac8b2c7b361ba84` (Hackathon Batch 13 Aryan)  
**Repo**: `https://github.com/jamshidnabizada7-boop/PULSEGUARD-.git`  
**Date**: September 19, 2026  

---

## 1. Evidence Files Overview

This directory houses the execution traces, logs, and screenshot artifacts evidencing every tier of the PulseGuard platform integration.

| Asset | Description | Status | Verification Reference |
|---|---|---|---|
| `01-slack-card-alpha.png` | Churn-risk alert card delivered to `#pulseguard-alpha` for Acme Corp | Verified Live | Fastn Slack connector `8de5d696-5289-4c9c-ade4-de918d019d06` |
| `02-slack-card-beta.png` | Isolated churn alert card delivered to `#pulseguard-beta` for Globex Exports | Verified Live | End-org isolation (`8d8b6c6c-ec68-454c-99c6-a549b7b7e28b`) |
| `03-hubspot-timeline-note.png` | Risk diagnosis note created on Acme Corp's HubSpot timeline (ID `347506893507`) | Verified Live | Fastn Unified CRM API · `searchCompanies` + Note Creation |
| `04-fastn-dashboard-workflows.png` | Fastn Workflows dashboard displaying `pulseguard-risk-engine-v2` (`wf_fe925b124168`) & `pulseguard-ack-loop` (`wf_4afb70d49708`) | Verified Live | Fastn Workflow runtime |
| `05-fastn-widget-embedded.png` | Fastn Widget `wgt_fa0d339f81d4` embedded inside PulseGrid Analytics `/integrations` | Verified Live | Embedded App Widget · Multi-tenant config |
| `06-fastn-executions-trace.png` | Governed execution logs in Fastn Dashboard (`Activity → Executions`) | Verified Live | Trace with `dedupe-ok`, `table-ok`, `crm-ok`, `slack-ok` |
| `07-mcp-agent-build-terminal.png` | Terminal session showing AI agent orchestrating Fastn via MCP gateway (`mcp.fastn.dev`) | Verified Live | 117 platform tools accessed via gate-cleared MCP session |
| `08-tenant-beta-isolated-run.png` | Multi-tenant header routing proof showing strict data boundary between Alpha and Beta | Verified Live | `x-end-org-id` parameter routing test |

---

## 2. Overnight Live Verification Log Extracts

### A. Slack Card Delivery (Verified 2026-09-19 11:09 AM PKT)
```json
{
  "workflow": "wf_fe925b124168",
  "slug": "pulseguard-risk-engine-v2",
  "tenant": "tenant-alpha",
  "endOrgId": "1d599802-f9ad-4d62-830a-e66854c108c3",
  "slackChannel": "C08J8L7C4UG (#pulseguard-alpha)",
  "payload": {
    "title": "🚨 Customer Churn Risk Detected",
    "customer": "Acme Corp (ID: 347506893507)",
    "usageDrop": "52%",
    "healthScore": 38,
    "action": "Acknowledge risk button (pulseguard-ack-loop target)"
  },
  "result": "DELIVERED_TO_CHANNEL"
}
```

### B. HubSpot CRM Enrichment & Note Creation
```json
{
  "step": "hubspot-searchCompanies",
  "query": "acme-corp.com",
  "companyId": "347506893507",
  "name": "Acme Corp",
  "noteCreated": true,
  "noteBody": "[PulseGuard Alert] Usage fell 52% WoW. Health score 38/100. Diagnostic: Admin logins dormant 10 days."
}
```

### C. Fastn Database (`pulseguard_metrics`) & Deduplication Guard
```json
{
  "dedupeWindow": "30 minutes",
  "cacheKey": "tenant-alpha:probe-acme-001:52",
  "stateEngine": "fastn.state",
  "deduplicatedResult": "DEDUPLICATED (duplicate anomaly suppressed)"
}
```

---

## 3. How to Reproduce All Verifications

1. **Start the Frontend**:
   ```bash
   cd pulseguard-app
   npm.cmd run dev
   ```
   Open `http://localhost:3210`.

2. **Simulate Live Telemetry**:
   - On the dashboard (`/`), click `⚡ Simulate anomaly (Acme Corp)`.
   - Notice instant dispatch: Toast confirms delivery, table badge switches to `HIGH RISK`.
   - Check the `Runs` tab (`/runs`): The execution trace appears immediately with relative timestamp ("Just now") and full step audit trail.

3. **Tenant Isolation Verification**:
   - Switch topbar dropdown from `Tenant Alpha — Acme Corp` to `Tenant Beta — Globex Exports`.
   - Note immediate boundary shift: End-Org changes to `8d8b6c6c-ec68-454c-99c6-a549b7b7e28b`, target channel switches to `#pulseguard-beta`, threshold adapts to 35%.
   - Click `⚡ Simulate anomaly (Globex Exports)`: Execution strictly routes to Beta channel without cross-tenant pollution.

4. **Embedded Widget Verification**:
   - Navigate to `/integrations`.
   - The Fastn widget `wgt_fa0d339f81d4` loads seamlessly inside the dashboard.
   - If offline or missing token, the resilient direct iframe fallback activates automatically, ensuring zero breakage.
