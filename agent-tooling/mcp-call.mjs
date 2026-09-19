#!/usr/bin/env node
// Fires a sequence of MCP tool calls through mcp-remote in ONE gateway session and prints parsed responses.
// Usage: node .pg-call.mjs '{"label":"getWf","tool":"fastnPlatform__getWorkflow","args":{"id":"wf_x"}}' ...
// Env: PG_TIMEOUT_MS (default 130000), PG_TAIL (default 22000)
import { execSync } from 'child_process';
import fs from 'fs';

const calls = process.argv.slice(2).map((a) => JSON.parse(a.trim().startsWith('{') ? a : fs.readFileSync(a, 'utf8')));
const NPX = 'C:/Program Files/nodejs/npx.cmd';
const TIMEOUT = Number(process.env.PG_TIMEOUT_MS || 130000);
const TAIL = Number(process.env.PG_TAIL || 22000);
const LOG = '.pg-run.log';
const STDIN = '.pg-stdin.txt';

const lines = [
  JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'zcode', version: '1.0' } } }),
  JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'skill', arguments: { slug: 'gateway' } } }),
];
let id = 3;
const idMap = {};
for (const c of calls) {
  idMap[id] = c.label || c.tool;
  lines.push(JSON.stringify({ jsonrpc: '2.0', id, method: 'tools/call', params: { name: c.tool, arguments: c.args || {} } }));
  id++;
}
fs.writeFileSync(STDIN, lines.join('\n') + '\n');

const sh = `#!/bin/bash
cd "$(dirname "$0")"
(head -n 3 .pg-stdin.txt; sleep 3; tail -n +4 .pg-stdin.txt; sleep ${Math.ceil(TAIL / 1000)}) | timeout ${Math.ceil(TIMEOUT / 1000)} "C:/Program Files/nodejs/npx.cmd" -y mcp-remote https://mcp.fastn.dev 2>/dev/null > .pg-run.log
`;
fs.writeFileSync('.pg-run.sh', sh);
try { execSync('bash .pg-run.sh', { stdio: 'ignore', timeout: TIMEOUT + 30000 }); } catch { /* timeout SIGTERMs; log has what arrived */ }

const buf = fs.readFileSync(LOG, 'utf8');
const out = { _responses: [] };
for (const line of buf.split('\n')) {
  if (!line.trim()) continue;
  try {
    const m = JSON.parse(line);
    if (m.id && m.id >= 3) {
      const label = idMap[m.id] || String(m.id);
      const resp = m.error ? { label, error: m.error } : {
        label,
        isError: !!m.result?.isError,
        text: (m.result?.content || []).map((x) => x.text || '').join('\n'),
        structured: m.result?.structuredContent ?? null,
      };
      out._responses.push(resp);
      out[label] = resp;
    }
  } catch { /* non-JSON noise */ }
}
console.log(JSON.stringify(out, null, 1));
