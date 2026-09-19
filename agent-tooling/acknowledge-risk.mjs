#!/usr/bin/env node
/**
 * Fastn Risk Acknowledgment Dispatcher (Multi-Tenant)
 * Triggers live pulseguard-ack-loop workflow execution on Fastn runtime for Tenant Alpha or Tenant Beta
 * Usage:
 *   node agent-tooling/acknowledge-risk.mjs alpha [ackBy]
 *   node agent-tooling/acknowledge-risk.mjs beta [ackBy]
 */
import { spawn } from 'child_process';

const tenantArg = (process.argv[2] || 'beta').toLowerCase();
const ackBy = process.argv[3] || 'Customer Success';
const isBeta = tenantArg.includes('beta');

const config = isBeta
  ? {
      tenant: 'tenant-beta',
      endOrgId: '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
      customerId: '347476273912',
      accountName: 'Globex Exports',
    }
  : {
      tenant: 'tenant-alpha',
      endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
      customerId: '347506893507',
      accountName: 'Acme Corp',
    };

console.log(`\n🚀 Dispatching live acknowledgment to Fastn for ${config.accountName} (${config.tenant})...`);
console.log(`   Acknowledged by: ${ackBy} | HubSpot Company ID: ${config.customerId}`);

const payload = {
  label: 'ack',
  tool: 'fastnPlatform__testSavedWorkflow',
  args: {
    id: 'wf_4afb70d49708',
    input: {
      tenant: config.tenant,
      customerId: config.customerId,
      ackBy,
    },
    headers: {
      'x-end-org-id': config.endOrgId,
    },
  },
};

const proc = spawn('node', ['agent-tooling/mcp-call.mjs', JSON.stringify(payload)], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buffer = '';
proc.stdout.on('data', (d) => (buffer += d));
proc.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Process exited with code ${code}`);
    process.exit(code);
  }
  try {
    const json = JSON.parse(buffer);
    const textData = JSON.parse(json.ack.text);
    const res = textData.data.result;
    console.log(`\n✅ Acknowledgment Workflow Succeeded!`);
    console.log(`   Status:       ${res.status}`);
    console.log(`   Tenant:       ${res.tenant}`);
    console.log(`   Customer:     ${config.accountName} (${res.customerId})`);
    console.log(`   Ack By:       ${res.ackBy}`);
    if (res.steps) {
      console.log(`   Trace Steps:  ${res.steps.join(' -> ')}`);
    }
  } catch (e) {
    console.log('Raw output:', buffer);
  }
});
