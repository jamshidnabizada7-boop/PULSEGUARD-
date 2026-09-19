'use client';
import { useState, useEffect, useCallback } from 'react';
import { TENANT_LIST, getTenant, tenantFromSearch, pushTenant, FASTN_ORG_ID, WIDGET_ID, WORKFLOWS } from '../../lib/tenants';
import InfoDot from '../../components/InfoDot';
import {
  IconActivity,
  IconAlert,
  IconRefresh,
  IconZap,
  IconSpinner,
  IconCheckCircle,
  IconChevronDown,
  IconShield,
} from '../../components/icons';

const HUMAN_STATUS = {
  RISK_ESCALATED: 'Alert sent',
  ACKNOWLEDGED: 'Risk handled',
  DEDUPLICATED: 'Duplicate blocked',
  HEALTHY: 'All good',
};

const HUMAN_VIA = {
  'fastn-runtime': 'Fastn runtime',
  'fastn-state-engine': 'Fastn runtime',
  'live-webhook-trigger': 'Live webhook',
  'live-execute-endpoint': 'Live execution',
  'live-ack-workflow': 'Live execution',
  'api-ack': 'Dashboard',
  'api-telemetry': 'Dashboard',
  'simulated-dispatch': 'Demo simulation',
  'local-ack-fallback': 'Recorded locally',
};

function humanVia(v) {
  if (!v) return 'Fastn runtime';
  const clean = v.replace('-fallback', '');
  return HUMAN_VIA[clean] || clean;
}

function formatTimeAgo(isoString) {
  if (!isoString) return 'recently';
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Runs() {
  const [tenant, setTenant] = useState('all');
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPlatform, setShowPlatform] = useState(false);

  const syncTenantFromUrl = useCallback(() => {
    setTenant(tenantFromSearch('all'));
  }, []);

  useEffect(() => {
    setMounted(true);
    setLastUpdated(Date.now());
    syncTenantFromUrl();
    window.addEventListener('popstate', syncTenantFromUrl);
    window.addEventListener('tenantchange', syncTenantFromUrl);
    return () => {
      window.removeEventListener('popstate', syncTenantFromUrl);
      window.removeEventListener('tenantchange', syncTenantFromUrl);
    };
  }, [syncTenantFromUrl]);

  const handleTenantChange = useCallback((nextTenant) => {
    setTenant(nextTenant);
    pushTenant(nextTenant);
  }, []);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch(`/api/runs${tenant !== 'all' ? `?tenant=${tenant}` : ''}`);
      const data = await res.json();
      let apiRuns = data.ok && Array.isArray(data.runs) ? data.runs : [];

      let localRuns = [];
      if (typeof window !== 'undefined') {
        try {
          localRuns = JSON.parse(localStorage.getItem('pulseguard_runs') || '[]');
          if (tenant !== 'all') {
            localRuns = localRuns.filter((r) => r.tenant === tenant);
          }
        } catch {}
      }

      const seen = new Set();
      const combined = [];
      for (const r of [...localRuns, ...apiRuns]) {
        const id = r.id || `${r.at}_${r.customer}`;
        if (!seen.has(id)) {
          seen.add(id);
          combined.push(r);
        }
      }

      combined.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
      setRuns(combined);
      setLastUpdated(Date.now());
    } catch (e) {
      console.error('Failed to load runs:', e);
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  useEffect(() => {
    fetchRuns();
    const timer = setInterval(() => {
      fetchRuns();
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchRuns]);

  async function triggerRun() {
    setTriggering(true);
    const targetTenant = tenant === 'all' || tenant === 'tenant-alpha' ? 'tenant-alpha' : 'tenant-beta';
    const t = getTenant(targetTenant);
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: t.primaryCustomerId,
          customerDomain: t.primaryDomain,
          healthScore: t.dropHealth,
          usageDropPct: t.dropPct,
          metricSummary: `On-demand anomaly triggered for ${t.company}.`,
          tenant: targetTenant,
        }),
      });
      const j = await res.json().catch(() => ({}));

      if (typeof window !== 'undefined') {
        try {
          const existing = JSON.parse(localStorage.getItem('pulseguard_runs') || '[]');
          const newRun = (j && j.run) ? j.run : {
            id: `sim_${Date.now().toString(36)}`,
            wf: 'pulseguard-risk-engine-v2',
            tenant: targetTenant,
            endOrgId: t.endOrgId,
            customer: `${t.company} (${t.primaryCustomerId})`,
            status: 'RISK_ESCALATED',
            tier: 'instant',
            steps: `usageDrop ${t.dropPct}% >= threshold · crm-timeline-noted · slack-card-queued`,
            at: new Date().toISOString(),
            via: (j && j.via) || 'simulated-dispatch-fallback',
          };
          localStorage.setItem('pulseguard_runs', JSON.stringify([newRun, ...existing].slice(0, 50)));
        } catch {}
      }

      await fetchRuns();
    } catch (e) {
      console.error(e);
    }
    setTriggering(false);
  }

  function clearHistory() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pulseguard_runs');
      fetchRuns();
    }
  }

  const escalatedCount = runs.filter((r) => r.status === 'RISK_ESCALATED').length;
  const dedupCount = runs.filter((r) => r.status === 'DEDUPLICATED').length;
  const healthyCount = runs.filter((r) => r.status === 'HEALTHY').length;
  const ackCount = runs.filter((r) => r.status === 'ACKNOWLEDGED').length;

  return (
    <main>
      <div className="wrap">
        {/* Page header */}
        <div className="page-head">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ marginBottom: 0 }}>Activity &amp; proof</h1>
              <span className="badge" style={{ color: 'var(--muted)' }}>
                <span className="badge-dot pulse" style={{ color: 'var(--ok)' }} />
                Live
              </span>
            </div>
            <p className="sub" style={{ marginBottom: 0 }}>
              Every automated action PulseGuard took — newest first. Each row is one complete run:
              what happened, when, and every step in between.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn ghost" onClick={fetchRuns} style={{ fontSize: 13, padding: '9px 14px' }}>
              <IconRefresh size={14} />
              Refresh
            </button>
            <button className="btn btn-simulate" onClick={triggerRun} disabled={triggering} style={{ fontSize: 13.5 }}>
              {triggering ? (
                <>
                  <IconSpinner size={15} strokeWidth={2.5} />
                  <span>Running…</span>
                </>
              ) : (
                <>
                  <IconZap size={15} strokeWidth={2.25} />
                  <span>Simulate a run</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="kpis">
          <div className="kpi">
            <div className="l">
              <span>Total runs</span>
              <span className="icon-chip accent"><IconActivity size={15} /></span>
            </div>
            <div className="n">{runs.length}</div>
            <div className="sub-tag"><span>Since this demo started</span></div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Alerts sent</span>
              <span className="icon-chip risk"><IconAlert size={15} /></span>
            </div>
            <div className="n risk">{escalatedCount}</div>
            <div className="sub-tag"><span>Teams notified in time</span></div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Duplicates blocked</span>
              <span className="icon-chip warn"><IconShield size={15} /></span>
            </div>
            <div className="n warn">{dedupCount}</div>
            <div className="sub-tag"><span>No spam — same problem, one alert</span></div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Resolved or healthy</span>
              <span className="icon-chip ok"><IconCheckCircle size={15} /></span>
            </div>
            <div className="n ok">{ackCount + healthyCount}</div>
            <div className="sub-tag"><span>Handled or nothing to do</span></div>
          </div>
        </div>

        {/* Execution stream */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ margin: 0 }}>Run history</h2>
              <span className="badge ack" style={{ fontSize: 11.5 }}>
                <span className="badge-dot pulse" />
                Auto-refreshes
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="seg">
                {[['all', 'All tenants'], ['tenant-alpha', 'Tenant Alpha'], ['tenant-beta', 'Tenant Beta']].map(
                  ([id, label]) => (
                    <button
                      key={id}
                      className={`seg-btn ${tenant === id ? 'active' : ''}`}
                      onClick={() => handleTenantChange(id)}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
              <button className="btn ghost sm" onClick={clearHistory} title="Reset local demo events">
                Reset demo history
              </button>
            </div>
          </div>

          {loading ? (
            <div className="skeleton-rows">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton sk-b" />
                  <div className="skeleton sk-b" style={{ width: '22%' }} />
                  <div className="skeleton sk-b" style={{ width: '18%' }} />
                  <div className="skeleton sk-b" style={{ width: '14%' }} />
                </div>
              ))}
              <div className="muted" style={{ padding: '10px 16px 4px', fontSize: 12.5, textAlign: 'center' }}>
                Loading activity…
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Tenant &amp; account</th>
                    <th>Workflow</th>
                    <th>Outcome</th>
                    <th>Ran on</th>
                    <th>
                      Execution trace
                      <InfoDot
                        question="What is the execution trace?"
                        text="Every internal step of the run, in order — this is the proof that the automation really executed end to end."
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r, i) => {
                    const isAlpha = r.tenant === 'tenant-alpha';
                    const badgeClass =
                      r.status === 'HEALTHY'
                        ? 'healthy'
                        : r.status === 'DEDUPLICATED'
                        ? 'warn'
                        : r.status === 'ACKNOWLEDGED'
                        ? 'ack'
                        : 'risk';

                    const stepList = (r.steps || '').split(/·|->|→/).map((s) => s.trim()).filter(Boolean);

                    return (
                      <tr key={r.id || i}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>
                            {mounted ? formatTimeAgo(r.at) : 'recently'}
                          </div>
                          <div className="muted mono" style={{ fontSize: 11 }}>
                            {mounted && r.at ? new Date(r.at).toLocaleTimeString() : 'live trace'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              className="badge"
                              style={{ color: isAlpha ? 'var(--accent)' : 'var(--accent2)', fontSize: 10.5 }}
                            >
                              {isAlpha ? 'Alpha' : 'Beta'}
                            </span>
                            <strong style={{ color: '#fff' }}>{(r.customer || '').split(' (')[0] || (isAlpha ? 'Acme Corp' : 'Globex Exports')}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="mono" style={{ color: 'var(--accent-light)', fontSize: 12, fontWeight: 550 }}>
                            {r.wf === 'pulseguard-ack-loop' ? 'Acknowledgement loop' : 'Risk engine'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`} title={`Fastn status: ${r.status}`}>
                            <span className="badge-dot" />
                            {HUMAN_STATUS[r.status] || r.status}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--muted)', fontSize: 11 }}>
                            {humanVia(r.via)}
                          </span>
                        </td>
                        <td>
                          {stepList.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {stepList.map((st, idx) => (
                                <span
                                  key={idx}
                                  className="mono"
                                  style={{
                                    fontSize: 11,
                                    background: 'rgba(255, 255, 255, 0.035)',
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    border: '1px solid rgba(255, 255, 255, 0.07)',
                                    color: idx === 0 ? '#fafafa' : 'var(--muted)',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {idx > 0 ? '→ ' : ''}{st}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="mono muted" style={{ fontSize: 11 }}>{r.steps}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {runs.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <span className="empty-icon"><IconActivity size={22} /></span>
                          <div className="empty-title">No activity yet</div>
                          <div className="empty-sub">
                            Simulate an anomaly to watch PulseGuard detect it, update the CRM, and alert your team.
                          </div>
                          <button className="btn btn-simulate" onClick={triggerRun} disabled={triggering} style={{ marginTop: 14 }}>
                            <IconZap size={15} />
                            Simulate a run
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--muted)', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="badge-dot" style={{ color: 'var(--accent)' }} />
              Mirrors the workflow history in the Fastn studio, plus local demo events
            </span>
            <span>
              Last checked:{' '}
              <strong style={{ color: 'var(--text-dim)' }}>
                {mounted && lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Connecting…'}
              </strong>
            </span>
          </div>
        </div>

        {/* Platform details — everything technical lives here */}
        <div className="card">
          <button className="platform-toggle" onClick={() => setShowPlatform((v) => !v)} aria-expanded={showPlatform}>
            <IconChevronDown size={15} className={showPlatform ? 'open' : ''} />
            <span>Platform details</span>
            <span className="muted" style={{ fontWeight: 450, fontSize: 12 }}>
              IDs and workflow names — for engineers and support
            </span>
          </button>

          {showPlatform && (
            <div className="platform-grid">
              <div className="platform-item">
                <div className="platform-k">Fastn organization</div>
                <div className="platform-v mono">{FASTN_ORG_ID}</div>
              </div>
              <div className="platform-item">
                <div className="platform-k">Embed widget</div>
                <div className="platform-v mono">{WIDGET_ID}</div>
              </div>
              <div className="platform-item">
                <div className="platform-k">Risk engine workflow</div>
                <div className="platform-v mono">
                  {WORKFLOWS.riskEngine.name} ({WORKFLOWS.riskEngine.id})
                </div>
              </div>
              <div className="platform-item">
                <div className="platform-k">Acknowledgement workflow</div>
                <div className="platform-v mono">
                  {WORKFLOWS.ackLoop.name} ({WORKFLOWS.ackLoop.id})
                </div>
              </div>
              {TENANT_LIST.map((t) => (
                <div className="platform-item" key={t.id}>
                  <div className="platform-k">{t.company}</div>
                  <div className="platform-v mono">
                    {t.endOrgId} · {t.installationId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
