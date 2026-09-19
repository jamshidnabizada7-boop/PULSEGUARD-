'use client';
import { useState, useEffect, useCallback } from 'react';
import TopBar from './TopBar';

const PORTFOLIOS = {
  'tenant-alpha': {
    name: 'Tenant Alpha (Acme Corp)',
    endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
    channel: '#pulseguard-alpha',
    threshold: 40,
    totalArr: '$133.7K',
    avgHealth: 62,
    primaryCustomerId: 'probe-acme-001',
    primaryCustomerName: 'Acme Corp',
    primaryDomain: 'acme-corp.com',
    accounts: [
      { id: 'probe-acme-001', name: 'Acme Corp', domain: 'acme-corp.com', owner: 'J. Nabizada', arr: '$48,000', trend: [72, 70, 66, 60, 52, 45, 38], status: 'HIGH_RISK' },
      { id: 'acme-002', name: 'Northwind Traders', domain: 'northwind.com', owner: 'J. Nabizada', arr: '$21,500', trend: [78, 80, 79, 81, 80, 82, 81], status: 'HEALTHY' },
      { id: 'acme-003', name: 'Contoso Labs', domain: 'contoso.io', owner: 'J. Nabizada', arr: '$64,200', trend: [65, 66, 64, 67, 66, 68, 67], status: 'HEALTHY' },
    ],
  },
  'tenant-beta': {
    name: 'Tenant Beta (Globex Exports)',
    endOrgId: '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
    channel: '#pulseguard-beta',
    threshold: 35,
    totalArr: '$177.5K',
    avgHealth: 64,
    primaryCustomerId: 'probe-globex-001',
    primaryCustomerName: 'Globex Exports',
    primaryDomain: 'globex-exports.com',
    accounts: [
      { id: 'probe-globex-001', name: 'Globex Exports', domain: 'globex-exports.com', owner: 'J. Nabizada', arr: '$92,000', trend: [85, 82, 78, 70, 60, 48, 32], status: 'HIGH_RISK' },
      { id: 'globex-002', name: 'Initech Logistics', domain: 'initech-logistics.com', owner: 'J. Nabizada', arr: '$34,000', trend: [80, 81, 79, 83, 82, 84, 85], status: 'HEALTHY' },
      { id: 'globex-003', name: 'Umbrella Software', domain: 'umbrella-soft.io', owner: 'J. Nabizada', arr: '$51,500', trend: [70, 71, 69, 72, 73, 71, 74], status: 'HEALTHY' },
    ],
  },
};

function Spark({ points }) {
  const w = 90, h = 26, max = 100;
  const step = w / (points.length - 1);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - (p / max) * h).toFixed(1)}`).join(' ');
  const falling = points[points.length - 1] < points[0];
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={falling ? '#f43f5e' : '#34d399'} strokeWidth="2" />
    </svg>
  );
}

export default function Home() {
  const [tenant, setTenant] = useState('tenant-alpha');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [ackedMap, setAckedMap] = useState({});

  // Sync tenant from URL search params on mount and on popstate/tenantchange
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

    // Reset ack state for primary account when fresh anomaly triggers
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

        // Persist run event to localStorage for immediate reflection in Runs tab
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

      // Persist acknowledgment run event in localStorage
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1>Customer health — {currentPortfolio.name}</h1>
            <p className="sub" style={{ marginBottom: 0 }}>
              Telemetry → churn risk engine → CRM timeline → Slack card — closed loop governed by Fastn.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="mono muted" style={{ fontSize: 12 }}>
              Fastn Org: <span style={{ color: 'var(--accent)' }}>personal_dc05...ba84</span>
            </span>
            <div className="mono muted" style={{ fontSize: 12 }}>
              End-Org: <span style={{ color: 'var(--text)' }}>{currentPortfolio.endOrgId}</span>
            </div>
          </div>
        </div>

        <div className="kpis">
          <div className="kpi">
            <div className="l">Accounts at risk</div>
            <div className="n risk">{atRisk}</div>
          </div>
          <div className="kpi">
            <div className="l">Healthy accounts</div>
            <div className="n ok">{rows.length - atRisk}</div>
          </div>
          <div className="kpi">
            <div className="l">Portfolio ARR</div>
            <div className="n">{currentPortfolio.totalArr}</div>
          </div>
          <div className="kpi">
            <div className="l">Avg health score</div>
            <div className="n warn">
              {currentPortfolio.avgHealth}
              <span className="muted" style={{ fontSize: 14 }}>/100</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>
            <span>
              Monitored accounts ({rows.length})
              <span className="badge" style={{ marginLeft: 10, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent2)' }}>
                Target: {currentPortfolio.channel}
              </span>
            </span>
            <button className="btn" onClick={simulate} disabled={busy}>
              {busy ? 'Dispatching…' : `⚡ Simulate anomaly (${currentPortfolio.primaryCustomerName})`}
            </button>
          </h2>
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Owner</th>
                <th>ARR</th>
                <th>7-day health</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.name}</strong>
                    <div className="muted mono">{a.domain}</div>
                  </td>
                  <td className="muted">{a.owner}</td>
                  <td>{a.arr}</td>
                  <td>
                    <Spark points={a.trend} /> <span className="muted">{a.trend[a.trend.length - 1]}</span>
                  </td>
                  <td>
                    <span className={'badge ' + (a.status === 'HIGH_RISK' ? (a.acknowledged ? 'ack' : 'risk') : 'healthy')}>
                      {a.status === 'HIGH_RISK' ? (a.acknowledged ? 'ACKNOWLEDGED' : 'HIGH RISK') : 'HEALTHY'}
                    </span>
                  </td>
                  <td>
                    {a.status === 'HIGH_RISK' && !a.acknowledged ? (
                      <button
                        className="btn ghost"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => acknowledge(a.id)}
                      >
                        Acknowledge risk
                      </button>
                    ) : (
                      <span className="muted mono" style={{ fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>Autonomous Retention Loop Architecture</h2>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            Telemetry events hit Fastn carrying <span className="mono">x-end-org-id: {currentPortfolio.endOrgId}</span>.
            The <strong>PulseGuard Risk Engine</strong> workflow evaluates the drop against the tenant&apos;s configured
            threshold (<strong>{currentPortfolio.threshold}%</strong>), queries the CRM via Fastn&apos;s <strong>Unified CRM API</strong>,
            writes a diagnosis to the customer&apos;s timeline, and dispatches an interactive card to <strong>{currentPortfolio.channel}</strong>.
            Clicking &quot;Acknowledge&quot; triggers the <strong>PulseGuard Ack Loop</strong> workflow which closes the loop across CRM and this dashboard.
          </p>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
