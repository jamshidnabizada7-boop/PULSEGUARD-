'use client';
import { useEffect, useState, useCallback } from 'react';
import TopBar from '../TopBar';

const TENANT_INTEGRATIONS = {
  'tenant-alpha': {
    name: 'Tenant Alpha — Acme Corp',
    endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
    installationId: 'inst_dcafc09c2f07',
    hubspotCompany: 'Acme Corp (ID: 347506893507)',
    slackChannel: '#pulseguard-alpha',
    threshold: 40,
    status: 'ACTIVE',
  },
  'tenant-beta': {
    name: 'Tenant Beta — Globex Exports',
    endOrgId: '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
    installationId: 'inst_6e346d508e28',
    hubspotCompany: 'Globex Exports (ID: 347476273912)',
    slackChannel: '#pulseguard-beta',
    threshold: 35,
    status: 'ACTIVE',
  },
};

export default function Integrations() {
  const [tenant, setTenant] = useState('tenant-alpha');

  const syncTenantFromUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const t = p.get('tenant');
      if (t && TENANT_INTEGRATIONS[t]) {
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

  const current = TENANT_INTEGRATIONS[tenant] || TENANT_INTEGRATIONS['tenant-alpha'];

  return (
    <main>
      <TopBar active="/integrations" tenant={tenant} onTenantChange={(t) => setTenant(t)} />
      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1>Integrations &amp; Embeddings</h1>
            <p className="sub" style={{ marginBottom: 0 }}>
              Connect your CRM and Slack. This panel embeds the governed <strong>Fastn Widget</strong> (<code>wgt_fa0d339f81d4</code>)
              with automatic direct iframe fallback and per-tenant isolation.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge ack">Multi-tenant Active</span>
            <div className="mono muted" style={{ fontSize: 12, marginTop: 4 }}>
              Installation: {current.installationId}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'rgba(14, 21, 36, 0.7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: 15 }}>Connect your stack</strong>
              <span className="badge warn" style={{ marginLeft: 10 }}>widget · wgt_fa0d339f81d4</span>
            </div>
            <div className="mono muted" style={{ fontSize: 12 }}>
              End-Org: <span style={{ color: 'var(--accent)' }}>{current.endOrgId}</span>
            </div>
          </div>
          <div className="iframe-wrap" style={{ border: 'none', borderRadius: 0, height: 600 }}>
            <WidgetMount tenant={tenant} currentConfig={current} />
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', background: 'var(--panel2)', fontSize: 12.5, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>
              Widget ID <span className="mono">wgt_fa0d339f81d4</span> · Workflows: <span className="mono">pulseguard-risk-engine-v2</span> + <span className="mono">pulseguard-ack-loop</span>
            </span>
            <span>Governance: Fastn Managed Runtime</span>
          </div>
        </div>

        <div className="card">
          <h2>
            <span>Connection status &amp; isolation</span>
            <span className="badge ack">Isolated per tenant</span>
          </h2>
          <table>
            <thead>
              <tr>
                <th>Connector</th>
                <th>Target Object / Scope</th>
                <th>Tenant Channel / Company</th>
                <th>Installation Ref</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>HubSpot</strong></td>
                <td>Unified CRM API · Company Timeline Notes</td>
                <td><span className="mono">{current.hubspotCompany}</span></td>
                <td><span className="mono muted">{current.installationId}</span></td>
                <td><span className="badge ack">ACTIVE</span></td>
              </tr>
              <tr>
                <td><strong>Slack</strong></td>
                <td>Interactive Churn Risk Cards</td>
                <td><strong style={{ color: 'var(--accent)' }}>{current.slackChannel}</strong></td>
                <td><span className="mono muted">{current.installationId}</span></td>
                <td><span className="badge ack">ACTIVE</span></td>
              </tr>
            </tbody>
          </table>
          <p className="muted" style={{ marginTop: 14, fontSize: 13, lineHeight: 1.6 }}>
            Both connectors are authenticated via Fastn managed connections. When an anomaly triggers, the Risk Engine executes against
            tenant <span className="mono">{current.endOrgId}</span>, ensuring Acme Corp alerts never leak into Globex Exports channels.
          </p>
        </div>
      </div>
    </main>
  );
}

function WidgetMount({ tenant, currentConfig }) {
  const [state, setState] = useState({
    loading: true,
    src: null,
    mode: 'token',
    directUrl: '',
    note: '',
  });
  const [viewMode, setViewMode] = useState('iframe'); // 'iframe' | 'preview'

  const fastnHost = process.env.NEXT_PUBLIC_FASTN_HOST || 'https://live.fastn.ai';
  const directFallback = `${fastnHost}/api/v1/embed/iframe?widgetId=wgt_fa0d339f81d4&endOrgId=${currentConfig.endOrgId}`;

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));

    fetch('/api/embed-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.ok && j.token) {
          setState({
            loading: false,
            src: `${fastnHost}/api/v1/embed/iframe?token=${j.token}`,
            mode: 'token',
            directUrl: j.directUrl || directFallback,
            note: 'Server-side embed token minted (8h lifetime)',
          });
        } else {
          // Direct iframe fallback for wgt_fa0d339f81d4
          const directSrc = j.directUrl || directFallback;
          setState({
            loading: false,
            src: directSrc,
            mode: 'direct-iframe',
            directUrl: directSrc,
            note: 'Direct iframe fallback active (bypassing token minting)',
          });
        }
      })
      .catch(() => {
        if (!alive) return;
        setState({
          loading: false,
          src: directFallback,
          mode: 'direct-iframe',
          directUrl: directFallback,
          note: 'Direct iframe fallback active',
        });
      });

    return () => {
      alive = false;
    };
  }, [tenant, currentConfig.endOrgId, directFallback, fastnHost]);

  if (state.loading) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0b0f17', color: '#8b9bb4', gap: 10 }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span>Loading Fastn widget for {currentConfig.name}…</span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      {/* Sub-header for widget mode */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px', background: 'rgba(11, 15, 23, 0.9)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" style={{ background: state.mode === 'token' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(34, 211, 238, 0.15)', color: state.mode === 'token' ? 'var(--ok)' : 'var(--accent)' }}>
            {state.mode === 'token' ? '● Token-Minted Embed' : '● Direct Iframe Fallback'}
          </span>
          <span className="mono muted" style={{ fontSize: 12 }}>{state.note}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a
            href={state.src || directFallback}
            target="_blank"
            rel="noopener noreferrer"
            className="btn ghost"
            style={{ padding: '4px 10px', fontSize: 12, textDecoration: 'none' }}
            title="Open direct iframe in new tab"
          >
            ↗ Open Fastn Frame
          </a>
          <button
            className={`btn ghost ${viewMode === 'iframe' ? 'active' : ''}`}
            style={{ padding: '4px 12px', fontSize: 12, borderColor: viewMode === 'iframe' ? 'var(--accent)' : 'var(--line)' }}
            onClick={() => setViewMode('iframe')}
          >
            Live Embed Iframe
          </button>
          <button
            className={`btn ghost ${viewMode === 'preview' ? 'active' : ''}`}
            style={{ padding: '4px 12px', fontSize: 12, borderColor: viewMode === 'preview' ? 'var(--accent)' : 'var(--line)' }}
            onClick={() => setViewMode('preview')}
          >
            Connector Specs
          </button>
        </div>
      </div>

      {viewMode === 'iframe' ? (
        <iframe
          src={state.src}
          style={{ width: '100%', flex: 1, border: 'none', background: '#fff' }}
          allow="clipboard-write"
          title="Fastn PulseGuard Integrations Widget"
        />
      ) : (
        <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#0d131f' }}>
          <h3 style={{ fontSize: 16, marginBottom: 8, color: '#e5edf8' }}>Fastn Widget: PulseGuard Integrations</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
            Widget ID: <code className="mono">wgt_fa0d339f81d4</code> · Type: <code>APP</code> · Activation: <code>SINGLE_ACTIVATION</code>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--panel)', padding: 16, borderRadius: 10, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <strong>HubSpot CRM Connector</strong>
                <span className="badge ack">Connected</span>
              </div>
              <p className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
                Connector ID: <code>9036a742-6baa-4c72-be3c-3789b34d6f9b</code><br />
                Enriches accounts via <code>searchCompanies</code> and writes diagnosis notes to the company timeline.
              </p>
            </div>

            <div style={{ background: 'var(--panel)', padding: 16, borderRadius: 10, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <strong>Slack Connector</strong>
                <span className="badge ack">Connected</span>
              </div>
              <p className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
                Connector ID: <code>8de5d696-5289-4c9c-ade4-de918d019d06</code><br />
                Posts interactive Block Kit alert cards to target channel <strong>{currentConfig.slackChannel}</strong>.
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--panel)', padding: 16, borderRadius: 10, border: '1px solid var(--line)' }}>
            <h4 style={{ fontSize: 14, marginBottom: 12 }}>Configured Form Schema (Installation {currentConfig.installationId})</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Alert Channel (slackChannel)</label>
                <input
                  type="text"
                  readOnly
                  value={currentConfig.slackChannel}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--panel2)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Churn Risk Threshold % (riskThreshold)</label>
                <input
                  type="text"
                  readOnly
                  value={`${currentConfig.threshold}%`}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--panel2)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
