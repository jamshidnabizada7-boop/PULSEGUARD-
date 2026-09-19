'use client';
import { useState, useEffect, useCallback } from 'react';
import TopBar from './TopBar';

const PORTFOLIOS = {
  'tenant-alpha': {
    name: 'Tenant Alpha (Acme Corp)',
    company: 'Acme Corp',
    shortCode: 'AC',
    endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
    channel: '#pulseguard-alpha',
    threshold: 40,
    totalArr: '$133.7K',
    avgHealth: 62,
    primaryCustomerId: 'probe-acme-001',
    primaryCustomerName: 'Acme Corp',
    primaryDomain: 'acme-corp.com',
    accounts: [
      { id: 'probe-acme-001', name: 'Acme Corp', shortCode: 'AC', domain: 'acme-corp.com', owner: 'J. Nabizada', arr: '$48,000', trend: [72, 70, 66, 60, 52, 45, 38], status: 'HIGH_RISK' },
      { id: 'acme-002', name: 'Northwind Traders', shortCode: 'NT', domain: 'northwind.com', owner: 'J. Nabizada', arr: '$21,500', trend: [78, 80, 79, 81, 80, 82, 81], status: 'HEALTHY' },
      { id: 'acme-003', name: 'Contoso Labs', shortCode: 'CL', domain: 'contoso.io', owner: 'J. Nabizada', arr: '$64,200', trend: [65, 66, 64, 67, 66, 68, 67], status: 'HEALTHY' },
    ],
  },
  'tenant-beta': {
    name: 'Tenant Beta (Globex Exports)',
    company: 'Globex Exports',
    shortCode: 'GE',
    endOrgId: '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
    channel: '#pulseguard-beta',
    threshold: 35,
    totalArr: '$177.5K',
    avgHealth: 64,
    primaryCustomerId: 'probe-globex-001',
    primaryCustomerName: 'Globex Exports',
    primaryDomain: 'globex-exports.com',
    accounts: [
      { id: 'probe-globex-001', name: 'Globex Exports', shortCode: 'GE', domain: 'globex-exports.com', owner: 'J. Nabizada', arr: '$92,000', trend: [85, 82, 78, 70, 60, 48, 32], status: 'HIGH_RISK' },
      { id: 'globex-002', name: 'Initech Logistics', shortCode: 'IL', domain: 'initech-logistics.com', owner: 'J. Nabizada', arr: '$34,000', trend: [80, 81, 79, 83, 82, 84, 85], status: 'HEALTHY' },
      { id: 'globex-003', name: 'Umbrella Software', shortCode: 'US', domain: 'umbrella-soft.io', owner: 'J. Nabizada', arr: '$51,500', trend: [70, 71, 69, 72, 73, 71, 74], status: 'HEALTHY' },
    ],
  },
};

function Spark({ points, isRisk }) {
  const w = 96, h = 28;
  const minVal = 20, maxVal = 100;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = (i * step).toFixed(1);
    const y = Math.max(3, Math.min(h - 3, h - ((p - minVal) / (maxVal - minVal)) * (h - 6))).toFixed(1);
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;
  const lastPoint = coords[coords.length - 1];

  const strokeColor = isRisk ? '#fb7185' : '#34d399';
  const fillGradientId = `grad_${isRisk ? 'risk' : 'ok'}_${points[0]}_${points[points.length - 1]}`;

  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${fillGradientId})`} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill={strokeColor} />
    </svg>
  );
}

export default function Home() {
  const [tenant, setTenant] = useState('tenant-alpha');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [ackedMap, setAckedMap] = useState({});

  const syncTenantFromUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const t = p.get('tenant');
      if (t && PORTFOLIOS[t]) {
        setTenant(t);
      }
    }
  }, []);

  useEffect(() => {
    syncTenantFromUrl();
    window.addEventListener('popstate', syncTenantFromUrl);
    window.addEventListener('tenantchange', syncTenantFromUrl);
    return () => {
      window.removeEventListener('popstate', syncTenantFromUrl);
      window.removeEventListener('tenantchange', syncTenantFromUrl);
    };
  }, [syncTenantFromUrl]);

  function handleTenantChange(newTenant) {
    if (PORTFOLIOS[newTenant]) {
      setTenant(newTenant);
    }
  }

  const currentPortfolio = PORTFOLIOS[tenant] || PORTFOLIOS['tenant-alpha'];

  const rows = currentPortfolio.accounts.map((a) => ({
    ...a,
    acknowledged: Boolean(ackedMap[`${tenant}:${a.id}`]),
  }));

  async function simulate() {
    setBusy(true);
    setToast(null);
    const primary = currentPortfolio.accounts[0];
    const dropPct = tenant === 'tenant-beta' ? 48 : 52;
    const health = tenant === 'tenant-beta' ? 32 : 38;

    setAckedMap((m) => {
      const next = { ...m };
      delete next[`${tenant}:${primary.id}`];
      return next;
    });

    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: primary.id,
          customerDomain: primary.domain,
          healthScore: health,
          usageDropPct: dropPct,
          metricSummary: `Simulated anomaly for ${primary.name}: sessions -${dropPct}% WoW, admin engagement dormant.`,
          tenant,
        }),
      });
      const j = await res.json();
      if (j.ok) {
        setToast(`⚡ Anomaly dispatched to Fastn (${j.via || 'live runtime'}) — alert queued for ${currentPortfolio.channel}`);

        if (typeof window !== 'undefined') {
          try {
            const existing = JSON.parse(localStorage.getItem('pulseguard_runs') || '[]');
            const runEntry = j.run || {
              id: `sim_${Date.now().toString(36)}`,
              wf: 'pulseguard-risk-engine-v2',
              tenant,
              endOrgId: currentPortfolio.endOrgId,
              customer: `${primary.name} (${primary.id})`,
              status: 'RISK_ESCALATED',
              tier: 'instant',
              steps: `usageDrop ${dropPct}% >= threshold · crm-timeline-noted · slack-alert-sent`,
              at: new Date().toISOString(),
              via: j.via || 'simulated-dispatch-fallback',
            };
            localStorage.setItem('pulseguard_runs', JSON.stringify([runEntry, ...existing].slice(0, 50)));
          } catch {}
        }
      } else {
        setToast('Dispatch failed: ' + (j.error || res.status));
      }
    } catch (e) {
      setToast('Dispatch failed: ' + e.message);
    }
    setBusy(false);
    setTimeout(() => setToast(null), 6000);
  }

  async function acknowledge(accId) {
    const acc = rows.find((a) => a.id === accId);
    if (!acc) return;
    try {
      const res = await fetch(
        `/api/ack?tenant=${tenant}&customer=${encodeURIComponent(acc.name)}&by=Customer%20Success&format=json`,
        { headers: { Accept: 'application/json' } }
      );
      const j = await res.json().catch(() => ({}));

      setAckedMap((m) => ({ ...m, [`${tenant}:${accId}`]: true }));
      setToast(`✅ Churn risk for ${acc.name} acknowledged — CRM timeline updated`);

      if (typeof window !== 'undefined') {
        try {
          const existing = JSON.parse(localStorage.getItem('pulseguard_runs') || '[]');
          const ackRun = (j && j.run) ? j.run : {
            id: `ack_${Date.now().toString(36)}`,
            wf: 'pulseguard-ack-loop',
            tenant,
            endOrgId: currentPortfolio.endOrgId,
            customer: acc.name,
            status: 'ACKNOWLEDGED',
            tier: 'instant',
            steps: 'ack-by-customer-success · crm-note-appended · risk-badge-cleared',
            at: new Date().toISOString(),
            via: 'api-ack',
          };
          localStorage.setItem('pulseguard_runs', JSON.stringify([ackRun, ...existing].slice(0, 50)));
        } catch {}
      }

      setTimeout(() => setToast(null), 5000);
    } catch {
      setAckedMap((m) => ({ ...m, [`${tenant}:${accId}`]: true }));
    }
  }

  const atRisk = rows.filter((r) => r.status === 'HIGH_RISK' && !r.acknowledged).length;

  return (
    <main>
      <TopBar active="/" tenant={tenant} onTenantChange={handleTenantChange} />
      <div className="wrap">
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1>Customer Health &amp; Retention Loop</h1>
              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                {currentPortfolio.company}
              </span>
            </div>
            <p className="sub" style={{ marginBottom: 0 }}>
              Autonomous closed-loop churn prevention powered by Fastn workflows · Telemetry → Risk Engine → CRM Timeline → Interactive Slack Card.
            </p>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
              Fastn Org: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>personal_dc05...ba84</span>
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
              End-Org: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{currentPortfolio.endOrgId}</span>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="kpis">
          <div className="kpi">
            <div className="l">
              <span>Accounts at Risk</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--risk)' }}>
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className={`n ${atRisk > 0 ? 'risk' : 'ok'}`}>
              {atRisk}
            </div>
            <div className="sub-tag">
              {atRisk > 0 ? (
                <>
                  <span className="badge-dot pulse" style={{ color: 'var(--risk)' }} />
                  <span>Threshold drop detected (&gt;{currentPortfolio.threshold}%)</span>
                </>
              ) : (
                <>
                  <span className="badge-dot" style={{ color: 'var(--ok)' }} />
                  <span>All anomalies mitigated</span>
                </>
              )}
            </div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Healthy Accounts</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ok)' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="n ok">{rows.length - atRisk}</div>
            <div className="sub-tag">
              <span>Normal usage &amp; active retention</span>
            </div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Guarded ARR</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="n">{currentPortfolio.totalArr}</div>
            <div className="sub-tag">
              <span>Protected portfolio revenue</span>
            </div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Avg Health Score</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--warn)' }}>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div className="n warn">
              {currentPortfolio.avgHealth}
              <span className="muted" style={{ fontSize: 15, fontWeight: 500 }}>/100</span>
            </div>
            <div className="sub-tag">
              <span>Weighted 7-day engagement index</span>
            </div>
          </div>
        </div>

        {/* Monitored Accounts Card */}
        <div className="card">
          <h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span>Monitored Accounts ({rows.length})</span>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent2)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                Alert Target: {currentPortfolio.channel}
              </span>
              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                Threshold: {currentPortfolio.threshold}% WoW
              </span>
            </div>

            {/* Prominent High-Impact CTA Button */}
            <button className="btn btn-simulate" onClick={simulate} disabled={busy}>
              {busy ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Dispatching to Fastn…</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>Simulate Anomaly ({currentPortfolio.primaryCustomerName})</span>
                </>
              )}
            </button>
          </h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Account &amp; Domain</th>
                  <th>CS Owner</th>
                  <th>Annual Contract (ARR)</th>
                  <th>7-Day Health Trend</th>
                  <th>Health Status</th>
                  <th>Autonomous Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const isHighRisk = a.status === 'HIGH_RISK';
                  const currentScore = a.trend[a.trend.length - 1];

                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="company-avatar">
                            {a.shortCode || a.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{a.name}</div>
                            <div className="muted mono" style={{ fontSize: 12 }}>{a.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span>{a.owner}</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#fff', fontSize: 14 }}>{a.arr}</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Spark points={a.trend} isRisk={isHighRisk && !a.acknowledged} />
                          <span className="mono" style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: isHighRisk && !a.acknowledged ? 'var(--risk)' : 'var(--ok)'
                          }}>
                            {currentScore}
                          </span>
                        </div>
                      </td>
                      <td>
                        {isHighRisk ? (
                          a.acknowledged ? (
                            <span className="badge ack">
                              <span className="badge-dot" />
                              ACKNOWLEDGED
                            </span>
                          ) : (
                            <span className="badge risk">
                              <span className="badge-dot pulse" />
                              HIGH RISK
                            </span>
                          )
                        ) : (
                          <span className="badge healthy">
                            <span className="badge-dot" />
                            HEALTHY
                          </span>
                        )}
                      </td>
                      <td>
                        {isHighRisk && !a.acknowledged ? (
                          <button
                            className="btn ghost"
                            style={{
                              padding: '6px 14px',
                              fontSize: 12,
                              color: '#fff',
                              background: 'rgba(6, 182, 212, 0.12)',
                              borderColor: 'rgba(6, 182, 212, 0.4)'
                            }}
                            onClick={() => acknowledge(a.id)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Acknowledge Risk
                          </button>
                        ) : a.acknowledged ? (
                          <span className="mono muted" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ok)' }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Synced to CRM
                          </span>
                        ) : (
                          <span className="muted mono" style={{ fontSize: 12 }}>Guarded</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Architecture Closed-Loop Explainer Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ margin: 0 }}>Autonomous Closed-Loop Retention Architecture</h2>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--ok)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              Fastn Multi-Tenant Workflow Mesh
            </span>
          </div>
          <p className="muted" style={{ fontSize: 13.5, marginBottom: 16 }}>
            Every step in the churn remediation cycle is executed and governed across Fastn connectors without data leakage between tenants.
          </p>

          <div className="pipeline-grid">
            <div className="pipeline-step">
              <div className="step-num">Step 01</div>
              <div className="step-title">Telemetry Ingestion</div>
              <div className="step-desc">
                Product telemetry hits Fastn carrying <span className="mono" style={{ color: 'var(--accent)' }}>x-end-org-id: {currentPortfolio.endOrgId}</span>.
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-num">Step 02</div>
              <div className="step-title">Risk Engine Eval</div>
              <div className="step-desc">
                Workflow <span className="mono" style={{ color: '#fff' }}>pulseguard-risk-engine-v2</span> evaluates engagement drop against threshold (<strong>{currentPortfolio.threshold}%</strong>).
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-num">Step 03</div>
              <div className="step-title">HubSpot CRM Note</div>
              <div className="step-desc">
                Fastn Unified CRM API searches account and appends automated root-cause timeline diagnosis.
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-num">Step 04</div>
              <div className="step-title">Slack Action Card</div>
              <div className="step-desc">
                Dispatches rich Block Kit alert card with metrics to target channel <strong style={{ color: 'var(--accent)' }}>{currentPortfolio.channel}</strong>.
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-num">Step 05</div>
              <div className="step-title">Fastn Ack Loop</div>
              <div className="step-desc">
                Clicking &quot;Acknowledge&quot; triggers <span className="mono" style={{ color: '#fff' }}>pulseguard-ack-loop</span>, closing the loop across CRM and dashboard.
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <span>{toast}</span>
        </div>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
