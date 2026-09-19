#!/usr/bin/env node
/**
 * Fastn Telemetry Anomaly Dispatcher (Multi-Tenant)
 * Triggers live workflow execution on Fastn runtime for Tenant Alpha or Tenant Beta
 * Usage:
 *   node agent-tooling/trigger-anomaly.mjs alpha
 *   node agent-tooling/trigger-anomaly.mjs beta
 */
import { spawn } from 'child_process';

const tenantArg = (process.argv[2] || 'beta').toLowerCase();
const isBeta = tenantArg.includes('beta');

const config = isBeta
  ? {
      tenant: 'tenant-beta',
      endOrgId: '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
      customerId: '347476273912',
      accountName: 'Globex Exports',
      customerDomain: 'globex-exports.com',
      healthScore: 32,
      usageDropPct: 48,
      channel: '#pulseguard-beta',
      threshold: 35,
    }
  : {
      tenant: 'tenant-alpha',
      endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
      customerId: '347506893507',
      accountName: 'Acme Corp',
      customerDomain: 'acme-corp.com',
      healthScore: 38,
      usageDropPct: 52,
      channel: '#pulseguard-alpha',
      threshold: 40,
    };

console.log(`\n🚀 Dispatching live anomaly to Fastn for ${config.accountName} (${config.tenant})...`);
console.log(`   Target Channel: ${config.channel} | HubSpot Company ID: ${config.customerId}`);

const payload = {
  label: 'trigger',
  tool: 'fastnPlatform__testSavedWorkflow',
  args: {
    id: 'wf_fe925b124168',
    input: {
      customerId: config.customerId,
      accountName: config.accountName,
      customerDomain: config.customerDomain,
      healthScore: config.healthScore,
      usageDropPct: config.usageDropPct,
      metricSummary: `Simulated anomaly for ${config.accountName}: sessions -${config.usageDropPct}% WoW, admin engagement dormant.`,
    },
    headers: {
      'x-end-org-id': config.endOrgId,
      'x-fastn-installation-config': JSON.stringify({
        slackChannel: config.channel,
        riskThreshold: config.threshold,
        ackBaseUrl: 'https://pulseguard-app-nu.vercel.app',
      }),
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
    const textData = JSON.parse(json.trigger.text);
    const res = textData.data.result;
    console.log(`\n✅ Execution Succeeded!`);
    console.log(`   Status:       ${res.status}`);
    console.log(`   Slack Alert:  ${res.notified ? 'DELIVERED to ' + res.channel : 'FAILED'}`);
    console.log(`   HubSpot Note: ${res.noteOk ? 'CREATED on Company ' + config.customerId : 'FAILED'}`);
    console.log(`   Trace Steps:  ${res.steps.join(' -> ')}`);
  } catch (e) {
    console.log('Raw output:', buffer);
  }
});
