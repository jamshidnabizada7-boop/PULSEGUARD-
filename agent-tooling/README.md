# Agent tooling — how PulseGuard was built through Fastn MCP

The entire backend was driven by an AI agent over the Fastn MCP gateway (mcp.fastn.dev).
`mcp-call.mjs` is the caller used for every platform operation during the build:

    node mcp-call.mjs '{"label":"exec","tool":"fastnPlatform__executeWorkflow","args":{"id":"pulseguard-risk-engine","input":{...}}}'

It opens a gate-cleared MCP session (gateway playbook read first, per Fastn's integration_builder
skill), fires the requested platform tools, and prints parsed JSON-RPC responses.
`docs/build-state.md` is the running build ledger from the overnight session.
