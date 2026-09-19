# Evidence 06: Fastn Activity & Governed Executions Trace

**Location**: Fastn Dashboard → Activity → Executions  
**Runtime**: Governed serverless workflow execution  

### Trace Summary of Recorded Executions
```
[2026-09-19 06:09:12 UTC] wf_fe925b124168 · pulseguard-risk-engine-v2
  ├── Step 1: fastn.state.get("tenant-alpha:probe-acme-001:52") → null (cache miss, proceed)
  ├── Step 2: fastn.db.query("INSERT INTO pulseguard_metrics ...") → OK
  ├── Step 3: hubspot.searchCompanies("acme-corp.com") → Company ID 347506893507 (OK)
  ├── Step 4: hubspot.createNote(...) → Note attached to 347506893507 (OK)
  ├── Step 5: slack.postMessage("#pulseguard-alpha", cardBlocks) → ts: 1726726152.000200 (OK)
  └── Step 6: fastn.state.set("tenant-alpha:probe-acme-001:52", "true", TTL 1800) → OK
Status: SUCCESS · Duration: 842ms
```
