'use client';
import { useState } from 'react';
import TopBar from './TopBar';

// Demo account portfolio. In production these rows come from the Fastn
// `pulseguard_metrics` table via the metrics API workflow.
const ACCOUNTS = [
  { id: 'probe-acme-001', name: 'Acme Corp', domain: 'acme-corp.com', owner: 'J. Nabizada', arr: '$48,000', trend: [72, 70, 66, 60, 52, 45, 38], status: 'HIGH_RISK', acknowledged: false },
  { id: 'acme-002', name: 'Northwind Traders', domain: 'northwind.com', owner: 'J. Nabizada', arr: '$21,500', trend: [78, 80, 79, 81, 80, 82, 81], status: 'HEALTHY', acknowledged: false },
  { id: 'acme-003', name: 'Contoso Labs', domain: 'contoso.io', owner: 'J. Nabizada', arr: '$64,200', trend: [65, 66, 64, 67, 66, 68, 67], status: 'HEALTHY', acknowledged: false },
];

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
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [rows, setRows] = useState(ACCOUNTS);

  async function simulate() {
    setBusy(true); setToast(null);
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: 'probe-acme-001', customerDomain: 'acme-corp.com', healthScore: 38, usageDropPct: 52, metricSummary: 'Simulated anomaly: sessions -52% WoW, admin logins absent 10 days.', tenant: 'tenant-alpha' }),
      });
      const j = await res.json();
      setToast(j.ok ? 'Anomaly dispatched to Fastn — watch Slack + the Runs page.' : 'Dispatch failed: ' + (j.error || res.status));
      setRows((r) => r.map((a) => (a.id === 'probe-acme-001' ? { ...a, status: 'HIGH_RISK' } : a)));
    } catch (e) { setToast('Dispatch failed: ' + e.message); }
    setBusy(false);
    setTimeout(() => setToast(null), 6000);
  }

  const atRisk = rows.filter((r) => r.status === 'HIGH_RISK').length;

  return (
    <main>
      <TopBar active="/" />
      <div className="wrap">
        <h1>Customer health</h1>
        <p className="sub">Telemetry → churn risk → CRM timeline → Slack — closed loop by PulseGuard on Fastn.</p>

        <div className="kpis">
          <div className="kpi"><div className="l">Accounts at risk</div><div className="n risk">{atRisk}</div></div>
          <div className="kpi"><div className="l">Healthy accounts</div><div className="n ok">{rows.length - atRisk}</div></div>
          <div className="kpi"><div className="l">Portfolio ARR</div><div className="n">$133.7K</div></div>
          <div className="kpi"><div className="l">Avg health score</div><div className="n warn">62<span className="muted" style={{ fontSize: 14 }}>/100</span></div></div>
        </div>

        <div className="card">
          <h2>
            Monitored accounts
            <button className="btn" onClick={simulate} disabled={busy}>{busy ? 'Dispatching…' : '⚡ Simulate anomaly (Acme Corp)'}</button>
          </h2>
          <table>
            <thead><tr><th>Account</th><th>Owner</th><th>ARR</th><th>7-day health</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.name}</strong><div className="muted mono">{a.domain}</div></td>
                  <td className="muted">{a.owner}</td>
                  <td>{a.arr}</td>
                  <td><Spark points={a.trend} /> <span className="muted">{a.trend[a.trend.length - 1]}</span></td>
                  <td><span className={'badge ' + (a.status === 'HIGH_RISK' ? 'risk' : 'healthy')}>{a.status === 'HIGH_RISK' ? (a.acknowledged ? 'ACKNOWLEDGED' : 'HIGH RISK') : 'HEALTHY'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>How the loop works</h2>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            Telemetry events hit a Fastn webhook carrying <span className="mono">x-end-org-id</span> and the
            customer's installation config. The <strong>Risk Engine</strong> workflow evaluates the drop against the
            tenant's threshold, enriches the account through Fastn's <strong>Unified CRM API</strong>, writes a
            diagnosis to the CRM timeline, and posts an interactive Slack card. Acknowledging the risk fires a second
            workflow that updates the CRM again and flips the badge here. Every step is visible under <a href="/runs" style={{ color: 'var(--accent)' }}>Runs</a>.
          </p>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
