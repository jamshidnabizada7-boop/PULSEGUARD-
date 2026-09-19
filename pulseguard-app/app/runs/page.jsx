'use client';
import { useState, useEffect, useCallback } from 'react';
import TopBar from '../TopBar';

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

  const syncTenantFromUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const t = p.get('tenant');
      setTenant(t && (t === 'tenant-alpha' || t === 'tenant-beta') ? t : 'all');
    }
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
    if (typeof window !== 'undefined') {
      const u = new URL(window.location.href);
      if (nextTenant === 'all') {
        u.searchParams.delete('tenant');
      } else {
        u.searchParams.set('tenant', nextTenant);
      }
      window.history.pushState({}, '', u.toString());
      window.dispatchEvent(new CustomEvent('tenantchange', { detail: nextTenant }));
    }
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

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 2000);
    return () => clearInterval(t);
  }, []);

  async function triggerRun() {
    setTriggering(true);
    const targetTenant = tenant === 'all' || tenant === 'tenant-alpha' ? 'tenant-alpha' : 'tenant-beta';
    const isAlpha = targetTenant === 'tenant-alpha';
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: isAlpha ? 'probe-acme-001' : 'probe-globex-001',
          customerDomain: isAlpha ? 'acme-corp.com' : 'globex-exports.com',
          healthScore: isAlpha ? 36 : 30,
          usageDropPct: isAlpha ? 54 : 49,
          metricSummary: `Dynamic on-demand anomaly triggered for ${isAlpha ? 'Acme Corp' : 'Globex Exports'}.`,
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
            endOrgId: isAlpha ? '1d599802-f9ad-4d62-830a-e66854c108c3' : '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
            customer: isAlpha ? 'Acme Corp (probe-acme-001)' : 'Globex Exports (probe-globex-001)',
            status: 'RISK_ESCALATED',
            tier: 'instant',
            steps: `usageDrop ${isAlpha ? 54 : 49}% >= threshold · crm-timeline-noted · slack-card-queued`,
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
      <TopBar active="/runs" tenant={tenant} onTenantChange={handleTenantChange} />
      <div className="wrap">
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1>Workflow Execution Activity</h1>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--ok)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <span className="badge-dot pulse" />
                Live Fastn Event Mesh
              </span>
            </div>
            <p className="sub" style={{ marginBottom: 0 }}>
              Audit traces across the Fastn runtime engine. Mirrors execution telemetry in Fastn Studio under <strong>Activity → Executions</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-simulate" onClick={triggerRun} disabled={triggering} style={{ fontSize: 13, padding: '9px 18px' }}>
              {triggering ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Dispatching…</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>Simulate Live Execution</span>
                </>
              )}
            </button>
            <button className="btn ghost" onClick={fetchRuns} style={{ fontSize: 13, padding: '9px 14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* 4 Execution KPI Cards */}
        <div className="kpis">
          <div className="kpi">
            <div className="l">
              <span>Total Executions</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="n">{runs.length}</div>
            <div className="sub-tag">
              <span>All recorded workflow triggers</span>
            </div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Risk Escalations</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--risk)' }}>
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              </svg>
            </div>
            <div className="n risk">{escalatedCount}</div>
            <div className="sub-tag">
              <span>High-risk threshold breaches</span>
            </div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Deduplicated</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--warn)' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <div className="n warn">{dedupCount}</div>
            <div className="sub-tag">
              <span>Guarded suppression window</span>
            </div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Acked / Healthy</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ok)' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="n ok">{ackCount + healthyCount}</div>
            <div className="sub-tag">
              <span>Resolved or steady telemetry</span>
            </div>
          </div>
        </div>

        {/* Execution Stream Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ margin: 0 }}>Live Execution Stream</h2>
              <span className="badge ack" style={{ fontSize: 11.5 }}>
                <span className="badge-dot pulse" />
                Polling 5s
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'rgba(14, 22, 38, 0.8)', borderRadius: 10, padding: 3, border: '1px solid var(--line)' }}>
                <button
                  className={`btn ghost ${tenant === 'all' ? 'active' : ''}`}
                  style={{ padding: '5px 12px', fontSize: 12, border: 'none', background: tenant === 'all' ? 'rgba(30, 41, 59, 0.9)' : 'transparent', color: tenant === 'all' ? '#fff' : 'var(--muted)' }}
                  onClick={() => handleTenantChange('all')}
                >
                  All Tenants
                </button>
                <button
                  className={`btn ghost ${tenant === 'tenant-alpha' ? 'active' : ''}`}
                  style={{ padding: '5px 12px', fontSize: 12, border: 'none', background: tenant === 'tenant-alpha' ? 'rgba(30, 41, 59, 0.9)' : 'transparent', color: tenant === 'tenant-alpha' ? 'var(--accent)' : 'var(--muted)' }}
                  onClick={() => handleTenantChange('tenant-alpha')}
                >
                  Tenant Alpha
                </button>
                <button
                  className={`btn ghost ${tenant === 'tenant-beta' ? 'active' : ''}`}
                  style={{ padding: '5px 12px', fontSize: 12, border: 'none', background: tenant === 'tenant-beta' ? 'rgba(30, 41, 59, 0.9)' : 'transparent', color: tenant === 'tenant-beta' ? 'var(--accent)' : 'var(--muted)' }}
                  onClick={() => handleTenantChange('tenant-beta')}
                >
                  Tenant Beta
                </button>
              </div>
              <button className="btn ghost" onClick={clearHistory} style={{ fontSize: 11.5, padding: '6px 10px' }} title="Reset local demo events">
                Clear Local
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ width: 28, height: 28, border: '3px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              Loading Fastn execution traces…
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Tenant &amp; Account</th>
                    <th>Fastn Workflow</th>
                    <th>Outcome</th>
                    <th>Runtime Mode</th>
                    <th>Step Execution Trace</th>
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

                    // Parse steps into visual breadcrumb items if separated by dots
                    const stepList = (r.steps || '').split('·').map((s) => s.trim()).filter(Boolean);

                    return (
                      <tr key={r.id || i}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff' }}>
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
                              style={{
                                fontSize: 10,
                                padding: '2px 8px',
                                background: isAlpha ? 'rgba(6, 182, 212, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                                color: isAlpha ? 'var(--accent)' : 'var(--accent2)',
                                border: isAlpha ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)',
                              }}
                            >
                              {isAlpha ? 'Alpha' : 'Beta'}
                            </span>
                            <strong style={{ color: '#fff' }}>{r.customer || (isAlpha ? 'Acme Corp' : 'Globex Exports')}</strong>
                          </div>
                          <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>
                            {r.endOrgId || (isAlpha ? '1d599802...108c3' : '8d8b6c6c...7b7e28b')}
                          </div>
                        </td>
                        <td>
                          <span className="mono" style={{ color: 'var(--accent-light)', fontSize: 12.5, fontWeight: 600 }}>
                            {r.wf || 'pulseguard-risk-engine-v2'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`}>
                            <span className="badge-dot" />
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--muted)', fontSize: 11 }}>
                            {r.via ? r.via.replace('-fallback', '') : 'fastn-live'}
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
                                    background: 'rgba(15, 23, 42, 0.85)',
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    border: '1px solid var(--line)',
                                    color: idx === 0 ? '#f8fafc' : 'var(--muted)',
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
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--muted)', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="badge-dot" style={{ color: 'var(--accent)' }} />
              Wired to <span className="mono" style={{ color: '#cbd5e1' }}>fastnPlatform__listWorkflowExecutions</span> and local event mesh
            </span>
            <span>
              Last polled:{' '}
              <strong style={{ color: '#cbd5e1' }}>{mounted && lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Connecting…'}</strong>
            </span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
