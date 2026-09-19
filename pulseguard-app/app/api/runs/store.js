// Shared in-memory run store for PulseGuard executions

let runsStore = [
  {
    id: 'run-live-001',
    wf: 'pulseguard-risk-engine-v2',
    tenant: 'tenant-alpha',
    endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
    customer: 'Acme Corp (probe-acme-001)',
    status: 'RISK_ESCALATED',
    tier: 'instant',
    steps: 'dedupe-ok · table-ok · crm-note-ok · slack-card-ok',
    at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    via: 'fastn-runtime',
  },
  {
    id: 'run-live-002',
    wf: 'pulseguard-risk-engine-v2',
    tenant: 'tenant-alpha',
    endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
    customer: 'Acme Corp (probe-acme-001)',
    status: 'DEDUPLICATED',
    tier: 'instant',
    steps: 'fastn.state dedupe · 30-min idempotency window hit',
    at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    via: 'fastn-state-engine',
  },
  {
    id: 'run-live-003',
    wf: 'pulseguard-risk-engine-v2',
    tenant: 'tenant-beta',
    endOrgId: '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
    customer: 'Globex Exports (probe-globex-001)',
    status: 'HEALTHY',
    tier: 'instant',
    steps: 'healthScore 82 >= 35 · metrics-table-updated',
    at: new Date(Date.now() - 1000 * 60 * 62).toISOString(),
    via: 'fastn-runtime',
  },
];

export function getRuns(tenant) {
  if (tenant && tenant !== 'all') {
    return runsStore.filter((r) => r.tenant === tenant);
  }
  return runsStore;
}

export function recordRun(run) {
  const newRun = {
    id: run.id || `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    wf: run.wf || 'pulseguard-risk-engine-v2',
    tenant: run.tenant || 'tenant-alpha',
    endOrgId: run.endOrgId || (run.tenant === 'tenant-beta' ? '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b' : '1d599802-f9ad-4d62-830a-e66854c108c3'),
    customer: run.customer || (run.tenant === 'tenant-beta' ? 'Globex Exports (probe-globex-001)' : 'Acme Corp (probe-acme-001)'),
    status: run.status || 'RISK_ESCALATED',
    tier: run.tier || 'instant',
    steps: run.steps || 'telemetry-received · threshold-evaluated · crm-updated · slack-notified',
    at: run.at || new Date().toISOString(),
    via: run.via || 'simulated-dispatch-fallback',
    detail: run.detail || null,
  };
  runsStore = [newRun, ...runsStore].slice(0, 50);
  return newRun;
}
