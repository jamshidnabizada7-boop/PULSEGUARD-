#!/usr/bin/env node
// Fires a sequence of MCP tool calls through mcp-remote in ONE gateway session and prints parsed responses.
// Cross-platform (Windows, Linux, macOS) — uses native Node.js streams without bash/timeout dependencies.
// Usage:
//   node agent-tooling/mcp-call.mjs '{\"label\":\"getInst\",\"tool\":\"fastnPlatform__getInstallation\",\"args\":{\"id\":\"inst_dcafc09c2f07\"}}'
//   node agent-tooling/mcp-call.mjs args.json
// Env: PG_TIMEOUT_MS (default 60000), FASTN_GATEWAY (default https://mcp.fastn.dev)
import { spawn } from 'child_process';
import readline from 'readline';
import fs from 'fs';

function parseArg(arg) {
  const trimmed = arg.trim();
  if (fs.existsSync(trimmed)) {
    return JSON.parse(fs.readFileSync(trimmed, 'utf8'));
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      const sanitized = trimmed
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/:\s*([a-zA-Z0-9_#/:.-]+)(\s*[,}])/g, ':"$1"$2');
      return JSON.parse(sanitized);
    } catch {
      return (new Function('return (' + trimmed + ')'))();
    }
  }
}

const rawArgs = process.argv.slice(2);
if (rawArgs.length === 0) {
  console.error('Usage: node mcp-call.mjs <callJsonOrFilePath> [...]');
  process.exit(1);
}

const calls = rawArgs.map(parseArg);
const GATEWAY_URL = process.env.FASTN_GATEWAY || 'https://mcp.fastn.dev';
const TIMEOUT = Number(process.env.PG_TIMEOUT_MS || 60000);

const isWin = process.platform === 'win32';
const proc = isWin
  ? spawn('cmd.exe', ['/c', 'npx', '-y', 'mcp-remote', GATEWAY_URL], { stdio: ['pipe', 'pipe', 'inherit'] })
  : spawn('npx', ['-y', 'mcp-remote', GATEWAY_URL], { stdio: ['pipe', 'pipe', 'inherit'] });

const out = { _responses: [] };
const idMap = {};
let currentCallIdx = 0;

const rl = readline.createInterface({ input: proc.stdout });

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line);
    if (msg.id === 1) {
      // Send initialized notification and initialize gateway skill
      proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
      setTimeout(() => {
        proc.stdin.write(JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: { name: 'skill', arguments: { slug: 'gateway' } }
        }) + '\n');
      }, 500);
    } else if (msg.id === 2) {
      // Skill gateway ready -> send first call
      sendNextCall();
    } else if (msg.id >= 3) {
      const label = idMap[msg.id] || String(msg.id);
      const resp = msg.error ? { label, error: msg.error } : {
        label,
        isError: !!msg.result?.isError,
        text: (msg.result?.content || []).map((x) => x.text || '').join('\n'),
        structured: msg.result?.structuredContent ?? null,
      };
      out._responses.push(resp);
      out[label] = resp;

      currentCallIdx++;
      if (currentCallIdx < calls.length) {
        setTimeout(sendNextCall, 300);
      } else {
        // All calls finished
        console.log(JSON.stringify(out, null, 2));
        proc.kill();
        process.exit(0);
      }
    }
  } catch {
    // Non-JSON noise ignored
  }
});

function sendNextCall() {
  const call = calls[currentCallIdx];
  const callId = currentCallIdx + 3;
  idMap[callId] = call.label || call.tool;
  proc.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: callId,
    method: 'tools/call',
    params: { name: call.tool, arguments: call.args || {} }
  }) + '\n');
}

// Start handshake
proc.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'pulseguard-agent', version: '1.0' }
  }
}) + '\n');

const timer = setTimeout(() => {
  console.error('Timeout waiting for MCP response after ' + TIMEOUT + 'ms');
  proc.kill();
  process.exit(1);
}, TIMEOUT);

proc.on('close', () => clearTimeout(timer));
