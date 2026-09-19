#!/usr/bin/env node
/**
 * Fastn Telemetry Anomaly Dispatcher (Multi-Tenant)
 * Triggers live workflow execution on Fastn runtime for Tenant Alpha or Tenant Beta
 * Usage:
 *   node agent-tooling/trigger-anomaly.mjs alpha [dropPct]
 *   node agent-tooling/trigger-anomaly.mjs beta [dropPct]
 *
 * Examples:
 *   node agent-tooling/trigger-anomaly.mjs beta       # Uses fresh drop % to bypass deduplication
 *   node agent-tooling/trigger-anomaly.mjs beta 48    # Tests specific drop % (or dedupe if run <30m ago)
 */
import { spawn } from 'child_process';

const tenantArg = (process.argv[2] || 'beta').toLowerCase();
const dropArg = process.argv[3] ? Number(process.argv[3]) : null;
const isBeta = tenantArg.includes('beta');

// Generate slightly dynamic drop % by default to guarantee bypassing Fastn's 30-min deduplication window
const defaultBetaDrop = 45 + Math.floor((Date.now() / 1000) % 20); // 45-64%
const defaultAlphaDrop = 50 + Math.floor((Date.now() / 1000) % 20); // 50-69%
const dropPct = dropArg !== null && !isNaN(dropArg) ? dropArg : (isBeta ? defaultBetaDrop : defaultAlphaDrop);

const config = isBeta
  ? {
      tenant: 'tenant-beta',
      endOrgId: '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
      customerId: '347476273912',
      accountName: 'Globex Exports',
      customerDomain: 'globex-exports.com',
      healthScore: 32,
      usageDropPct: dropPct,
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
      usageDropPct: dropPct,
      channel: '#pulseguard-alpha',
      threshold: 40,
    };

console.log(`\n🚀 Dispatching live anomaly to Fastn for ${config.accountName} (${config.tenant})...`);
console.log(`   Drop Percentage: ${config.usageDropPct}% (threshold: ${config.threshold}%)`);
console.log(`   Target Channel:  ${config.channel} | HubSpot Company ID: ${config.customerId}`);

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
      metricSummary: `Telemetry anomaly for ${config.accountName}: sessions -${config.usageDropPct}% WoW, admin engagement dormant.`,
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

    if (res.status === 'DEDUPLICATED') {
      console.log(`   Deduplication: SUPPRESSED (alert for drop ${config.usageDropPct}% was already sent within 30 min)`);
      console.log(`   Tip:           Pass a different drop % to trigger a fresh alert, e.g.:`);
      console.log(`                  node agent-tooling/trigger-anomaly.mjs ${isBeta ? 'beta' : 'alpha'} ${config.usageDropPct + 1}`);
    } else {
      console.log(`   Slack Alert:  ${res.notified ? 'DELIVERED to ' + res.channel : 'FAILED'}`);
      console.log(`   HubSpot Note: ${res.noteOk ? 'CREATED on Company ' + config.customerId : 'FAILED'}`);
    }
    if (res.steps) {
      console.log(`   Trace Steps:  ${res.steps.join(' -> ')}`);
    }
  } catch (e) {
    console.log('Raw output:', buffer);
  }
});
