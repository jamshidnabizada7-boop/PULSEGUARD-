'use client';
import { useEffect, useState } from 'react';
import TopBar from '../TopBar';

export default function Integrations() {
  return (
    <main>
      <TopBar active="/integrations" />
      <div className="wrap">
        <h1>Integrations</h1>
        <p className="sub">
          Connect your own CRM and messaging. This panel is the embedded <strong>Fastn widget</strong> —
          tokens are minted server-side per tenant (8h lifetime, auto-refreshed) and never expose keys to the browser.
        </p>
        <div className="card">
          <h2>Connect your stack <span className="badge warn">widget · wgt_fa0d339f81d4</span></h2>
          <div className="iframe-wrap"><WidgetMount /></div>
          <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
            Widget id <span className="mono">wgt_fa0d339f81d4</span> · token minted by <span className="mono">/api/embed-token</span> with
            <span className="mono"> POST /api/v1/embed/token</span> (Authorization stays server-side).
          </p>
        </div>
        <div className="card">
          <h2>Connection status</h2>
          <table>
            <thead><tr><th>Connector</th><th>Used for</th><th>Scope</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td><strong>HubSpot</strong></td><td>Account enrichment + risk timeline notes (Unified CRM)</td><td>Per tenant</td><td><span className="badge ack">ACTIVE</span></td></tr>
              <tr><td><strong>Slack</strong></td><td>Interactive churn-risk cards to the tenant's channel</td><td>Per tenant</td><td><span className="badge ack">ACTIVE</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function WidgetMount() {
  const [state, setState] = useState({ loading: true, src: null, note: '' });
  useEffect(() => {
    let alive = true;
    fetch('/api/embed-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.ok && j.token) {
          setState({ loading: false, src: `${process.env.NEXT_PUBLIC_FASTN_HOST || 'https://live.fastn.ai'}/api/v1/embed/iframe?token=${j.token}`, note: '' });
        } else { setState({ loading: false, src: null, note: j.hint || j.error || 'token unavailable' }); }
      })
      .catch((e) => alive && setState({ loading: false, src: null, note: e.message }));
    return () => { alive = false; };
  }, []);
  if (state.loading) return <div style={{ padding: 40, textAlign: 'center', color: '#8b9bb4' }}>Minting embed token…</div>;
  if (!state.src) {
    return (
      <div style={{ padding: 40, textAlign: 'center', background: '#0b0f17', color: '#8b9bb4', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        <strong style={{ color: '#e5edf8' }}>Widget mount ready</strong>
        <span>Set FASTN_API_KEY / FASTN_ORG_ID to render the live embed.</span>
        <span className="mono">POST /api/embed-token → GET /api/v1/embed/iframe?token=…</span>
        {state.note && <span className="mono" style={{ fontSize: 11 }}>{state.note}</span>}
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <iframe src={state.src} style={{ width: '100%', height: '100%', border: 'none' }} allow="clipboard-write" />;
}
