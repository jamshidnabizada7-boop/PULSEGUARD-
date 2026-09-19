# Evidence 07: Agent MCP Gateway Build Terminal Transcript

**Gateway**: `https://mcp.fastn.dev` (via `mcp-remote`)  
**Tools Discovered & Used**: 117 Fastn platform tools  
**Caller Script**: `agent-tooling/mcp-call.mjs`  

### Transcript Extract
```
> node agent-tooling/mcp-call.mjs '{"label":"createWf","tool":"fastnPlatform__createWorkflow","args":{"name":"PulseGuard Risk Engine v2","slug":"pulseguard-risk-engine-v2"}}'

[Fastn MCP Session Initialized]
→ tools/call skill {"slug":"gateway"}
← OK (gate-cleared)
→ tools/call fastnPlatform__createWorkflow {"name":"PulseGuard Risk Engine v2","slug":"pulseguard-risk-engine-v2"}
← Result: {"data":{"id":"wf_fe925b124168","version":"1","status":"draft"}}

> node agent-tooling/mcp-call.mjs '{"label":"editCode","tool":"fastnPlatform__editWorkflowCode","args":{"id":"wf_fe925b124168","code":"..."}}'
← Result: {"data":{"id":"wf_fe925b124168","version":"1","published":true}}
```
