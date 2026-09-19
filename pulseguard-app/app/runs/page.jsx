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

  // Sync tenant from URL search params
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

      // Merge with localStorage runs
      let localRuns = [];
      if (typeof window !== 'undefined') {
        try {
          localRuns = JSON.parse(localStorage.getItem('pulseguard_runs') || '[]');
          if (tenant !== 'all') {
            localRuns = localRuns.filter((r) => r.tenant === tenant);
          }
        } catch {}
      }

      // De-duplicate by ID
      const seen = new Set();
      const combined = [];
      for (const r of [...localRuns, ...apiRuns]) {
        const id = r.id || `${r.at}_${r.customer}`;
        if (!seen.has(id)) {
          seen.add(id);
          combined.push(r);
        }
      }

      // Sort newest first
      combined.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
      setRuns(combined);
      setLastUpdated(Date.now());
    } catch (e) {
      console.error('Failed to load runs:', e);
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  // Initial load and 5s auto-refresh
  useEffect(() => {
    fetchRuns();
    const timer = setInterval(() => {
      fetchRuns();
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchRuns]);

  // Tick clock every 2 seconds for relative times
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

      // Store run in localStorage so it persists across refreshes and restarts
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1>Workflow Execution Activity</h1>
            <p className="sub" style={{ marginBottom: 0 }}>
              Live execution logs across Fastn governed runtime. Mirrors activity in Fastn dashboard under{' '}
              <strong>Activity → Executions</strong>.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn" onClick={triggerRun} disabled={triggering} style={{ fontSize: 13, padding: '8px 14px' }}>
              {triggering ? 'Dispatching…' : '⚡ Simulate Live Execution'}
            </button>
            <button className="btn ghost" onClick={fetchRuns} style={{ fontSize: 13, padding: '8px 12px' }}>
              ↻ Refresh
            </button>
          </div>
        </div>

        <div className="kpis">
          <div className="kpi">
            <div className="l">Total Executions</div>
            <div className="n">{runs.length}</div>
          </div>
          <div className="kpi">
            <div className="l">Risk Escalations</div>
            <div className="n risk">{escalatedCount}</div>
          </div>
          <div className="kpi">
            <div className="l">Deduplicated (Guarded)</div>
            <div className="n warn">{dedupCount}</div>
          </div>
          <div className="kpi">
            <div className="l">Acknowledged / Healthy</div>
            <div className="n ok">{ackCount + healthyCount}</div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ margin: 0 }}>Live Execution Stream</h2>
              <span className="badge ack" style={{ fontSize: 11 }}>
                ● Auto-refreshing 5s
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', background: 'var(--panel2)', borderRadius: 8, padding: 3, border: '1px solid var(--line)' }}>
                <button
                  className={`btn ghost ${tenant === 'all' ? 'active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: 12, border: 'none', background: tenant === 'all' ? 'var(--panel)' : 'transparent', color: tenant === 'all' ? 'var(--text)' : 'var(--muted)' }}
                  onClick={() => handleTenantChange('all')}
                >
                  All Tenants
                </button>
                <button
                  className={`btn ghost ${tenant === 'tenant-alpha' ? 'active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: 12, border: 'none', background: tenant === 'tenant-alpha' ? 'var(--panel)' : 'transparent', color: tenant === 'tenant-alpha' ? 'var(--accent)' : 'var(--muted)' }}
                  onClick={() => handleTenantChange('tenant-alpha')}
                >
                  Tenant Alpha
                </button>
                <button
                  className={`btn ghost ${tenant === 'tenant-beta' ? 'active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: 12, border: 'none', background: tenant === 'tenant-beta' ? 'var(--panel)' : 'transparent', color: tenant === 'tenant-beta' ? 'var(--accent)' : 'var(--muted)' }}
                  onClick={() => handleTenantChange('tenant-beta')}
                >
                  Tenant Beta
                </button>
              </div>
              <button className="btn ghost" onClick={clearHistory} style={{ fontSize: 11, padding: '5px 8px' }}>
                Clear Local
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading execution traces…</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Tenant / Account</th>
                  <th>Workflow Slug</th>
                  <th>Outcome</th>
                  <th>Mode / Tier</th>
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

                  return (
                    <tr key={r.id || i}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                          {mounted ? formatTimeAgo(r.at) : 'recently'}
                        </span>
                        <div className="muted mono" style={{ fontSize: 11 }}>
                          {mounted && r.at ? new Date(r.at).toLocaleTimeString() : 'live trace'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            className="badge"
                            style={{
                              fontSize: 10,
                              padding: '2px 6px',
                              background: isAlpha ? 'rgba(34, 211, 238, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                              color: isAlpha ? 'var(--accent)' : 'var(--accent2)',
                            }}
                          >
                            {isAlpha ? 'Alpha' : 'Beta'}
                          </span>
                          <strong>{r.customer || (isAlpha ? 'Acme Corp' : 'Globex Exports')}</strong>
                        </div>
                        <div className="mono muted" style={{ fontSize: 11 }}>
                          {r.endOrgId || (isAlpha ? '1d599802...108c3' : '8d8b6c6c...7b7e28b')}
                        </div>
                      </td>
                      <td className="mono">{r.wf || 'pulseguard-risk-engine-v2'}</td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{r.status}</span>
                      </td>
                      <td className="muted mono" style={{ fontSize: 12 }}>
                        {r.via ? r.via.replace('-fallback', '') : 'fastn-live'}
                      </td>
                      <td className="mono muted" style={{ fontSize: 12, maxWidth: 360, wordBreak: 'break-word' }}>
                        {r.steps}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--muted)' }}>
            <span>
              Wired to <span className="mono">fastnPlatform__listWorkflowExecutions</span> and local event bus
            </span>
            <span>
              Last polled:{' '}
              {mounted && lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Connecting…'}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
