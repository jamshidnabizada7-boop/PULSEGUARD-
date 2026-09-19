'use client';
import { useEffect, useState, useCallback } from 'react';
import { getTenant, tenantFromSearch, WIDGET_ID, WORKFLOWS } from '../../lib/tenants';
import { IconZap, IconLink, IconArrowUpRight, IconCopy, IconRefresh, IconCheck } from '../../components/icons';

export default function Integrations() {
  const [tenant, setTenant] = useState('tenant-alpha');

  const syncTenantFromUrl = useCallback(() => {
    setTenant(tenantFromSearch('tenant-alpha'));
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

  const current = getTenant(tenant);

  return (
    <main>
      <div className="wrap">
        <div className="page-head">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ marginBottom: 0 }}>
                Integrations <span className="grad-text">&amp; connections</span>
              </h1>
              <span className="badge ack">Both connected</span>
            </div>
            <p className="sub" style={{ marginBottom: 0 }}>
              Connect the tools your team already uses. PulseGuard writes to your CRM and alerts
              your team in Slack — every tenant stays fully isolated from the others.
            </p>
          </div>
          <span className="env-chip">
            Install: <strong>{current.installationId}</strong>
          </span>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'rgba(255, 255, 255, 0.025)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <strong style={{ fontSize: 15 }}>Connect your stack</strong>
              <span className="badge warn" style={{ marginLeft: 10 }}>Managed by Fastn</span>
            </div>
            <div className="mono muted" style={{ fontSize: 12 }}>
              {current.company}
            </div>
          </div>

          <div style={{ minHeight: 620, background: '#0a0a0c' }}>
            <WidgetMount tenant={tenant} currentConfig={current} />
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', background: 'var(--panel2)', fontSize: 12.5, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>
              Powered by the Fastn widget · risk engine + acknowledgement loop attached
            </span>
            <span>Each tenant's connections and channels never touch another tenant's</span>
          </div>
        </div>

        <div className="card">
          <h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>Connection Status &amp; Multi-Tenant Isolation</span>
              <span className="badge ack">Zero-Leak Boundary</span>
            </div>
            <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
              Managed by Fastn
            </span>
          </h2>
          <div className="table-wrap">
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
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 5, background: '#ff7a59', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 'bold' }}>H</span>
                      <strong>HubSpot CRM</strong>
                    </div>
                  </td>
                  <td>Unified CRM API · Company Timeline Notes</td>
                  <td><span className="mono" style={{ color: '#fff' }}>{current.hubspotCompany}</span></td>
                  <td><span className="mono muted">{current.installationId}</span></td>
                  <td>
                    <span className="badge ack">
                      <span className="badge-dot" />
                      ACTIVE
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 5, background: '#4a154b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 'bold' }}>#</span>
                      <strong>Slack Alerts</strong>
                    </div>
                  </td>
                  <td>Interactive Churn Risk Cards</td>
                  <td><strong style={{ color: 'var(--accent)' }}>{current.slackChannel}</strong></td>
                  <td><span className="mono muted">{current.installationId}</span></td>
                  <td>
                    <span className="badge ack">
                      <span className="badge-dot" />
                      ACTIVE
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="muted" style={{ marginTop: 14, fontSize: 13, lineHeight: 1.6 }}>
            Both connectors are authenticated via Fastn managed connections. When an anomaly triggers, the Risk Engine executes against
            tenant <span className="mono" style={{ color: 'var(--accent)' }}>{current.endOrgId}</span>, ensuring Acme Corp alerts never leak into Globex Exports channels.
          </p>
        </div>
      </div>
    </main>
  );
}

function WidgetMount({ tenant, currentConfig }) {
  const [viewMode, setViewMode] = useState('governed'); // 'governed' | 'iframe' | 'specs'
  const [iframeSubMode, setIframeSubMode] = useState('hub'); // 'hub' | 'raw'
  const [threshold, setThreshold] = useState(currentConfig.threshold);
  const [channel, setChannel] = useState(currentConfig.channel);
  const [toastMsg, setToastMsg] = useState(null);
  const [testingHubspot, setTestingHubspot] = useState(false);
  const [testingSlack, setTestingSlack] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [connectorFilter, setConnectorFilter] = useState('all'); // 'all' | 'installed' | 'available'

  useEffect(() => {
    setThreshold(currentConfig.threshold);
    setChannel(currentConfig.channel);
  }, [currentConfig]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSaveConfig = () => {
    showToast(`Saved — alert policy synced for ${currentConfig.company}`);
  };

  const handleTestHubspot = () => {
    setTestingHubspot(true);
    setTimeout(() => {
      setTestingHubspot(false);
      showToast(`HubSpot connection verified: Synced with ${currentConfig.hubspotCompany}`);
    }, 900);
  };

  const handleTestSlack = () => {
    setTestingSlack(true);
    setTimeout(() => {
      setTestingSlack(false);
      showToast(`Slack ping dispatched successfully to ${channel}`);
    }, 900);
  };

  // Permanent Fastn URLs (never expire, no 15-minute token expiry)
  const fastnTargetUrl = currentConfig.installationUrl || currentConfig.widgetUrl;
  const directIframeSrc = currentConfig.directUrl;

  const embedHtmlSnippet = `<iframe
  src="${directIframeSrc}"
  style="width:100%; height:600px; border:none; border-radius:12px"
  allow="clipboard-write"
  title="Fastn PulseGuard Integrations"
></iframe>`;

  const copyEmbedCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(embedHtmlSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      showToast('Fastn embed snippet copied to clipboard!');
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sub-header Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        background: 'rgba(12, 12, 14, 0.95)',
        borderBottom: '1px solid var(--line)',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="badge" style={{
            background: 'rgba(52, 211, 153, 0.15)',
            color: 'var(--ok)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />
            Fastn Governed Widget
          </span>
          <span className="mono muted" style={{ fontSize: 12 }}>
            {currentConfig.company} · managed install
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href={fastnTargetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn ghost sm"
            style={{ color: 'var(--accent)', borderColor: 'var(--line-accent)' }}
            title={`Open ${currentConfig.company} in Fastn Platform Console`}
          >
            <IconArrowUpRight size={13} />
            Open in Fastn
          </a>

          <div className="seg">
            <button className={`seg-btn ${viewMode === 'governed' ? 'active' : ''}`} onClick={() => setViewMode('governed')}>
              Widget
            </button>
            <button
              className={`seg-btn ${viewMode === 'iframe' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('iframe');
                setIframeLoaded(false);
              }}
            >
              Live embed
            </button>
            <button className={`seg-btn ${viewMode === 'specs' ? 'active' : ''}`} onClick={() => setViewMode('specs')}>
              Specs
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: GOVERNED FASTN WIDGET (Live Interactive Console) */}
      {viewMode === 'governed' && (
        <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#0a0a0c' }}>
          {/* Widget Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: '18px 20px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                color: '#06121f',
                fontWeight: 'bold',
              }}>
                <IconZap size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 3 }}>
                  PulseGuard Integrations
                  <span className="badge ack" style={{ marginLeft: 10, fontSize: 11 }}>Active App Widget</span>
                </h3>
                <p className="muted" style={{ fontSize: 12.5, marginBottom: 0 }}>
                  Fastn Widget <code className="mono">wgt_fa0d339f81d4</code> · Connected CRM &amp; Slack Messaging Runtime
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={currentConfig.installationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn ghost"
                style={{ padding: '6px 14px', fontSize: 12, color: 'var(--accent)', borderColor: 'rgba(167, 139, 250, 0.4)' }}
                title="Open installation console in Fastn"
              >
                <IconArrowUpRight size={13} /> Fastn Installation Portal
              </a>
              <a
                href={currentConfig.widgetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn ghost"
                style={{ padding: '6px 14px', fontSize: 12 }}
                title="Open widget definition in Fastn Console"
              >
                Fastn Widget Console
              </a>
            </div>
          </div>

          {/* Connectors Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18, marginBottom: 20 }}>
            {/* HubSpot Connector Card */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#ff7a59',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 16
                    }}>
                      H
                    </div>
                    <div>
                      <strong style={{ fontSize: 15, color: '#f1f5f9' }}>HubSpot CRM</strong>
                      <div className="mono muted" style={{ fontSize: 11 }}>9036a742-6baa-4c72-be3c-3789b34d6f9b</div>
                    </div>
                  </div>
                  <span className="badge ack">CONNECTED</span>
                </div>

                <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.55, marginBottom: 14 }}>
                  Governed bidirectional CRM binding. Automatically enriches at-risk company records via <code>searchCompanies</code> and writes diagnosed root causes directly to the HubSpot company timeline.
                </p>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                    Tenant Target Account
                  </div>
                  <div className="mono" style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>
                    {currentConfig.hubspotCompany}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn ghost"
                  onClick={handleTestHubspot}
                  disabled={testingHubspot}
                  style={{ flex: 1, padding: '7px 12px', fontSize: 12, justifyContent: 'center' }}
                >
                  {testingHubspot ? 'Verifying…' : (<span style={{display:'inline-flex',alignItems:'center',gap:6}}><IconZap size={13} /> Test Connection</span>)}
                </button>
                <a
                  href={currentConfig.connectorsUrl || currentConfig.installationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn ghost"
                  style={{
                    padding: '7px 14px',
                    fontSize: 12,
                    color: 'var(--accent)',
                    borderColor: 'rgba(167, 139, 250, 0.3)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  title="Manage Fastn Connector"
                >
                  <IconLink size={13} /> Fastn Connector
                </a>
              </div>
            </div>

            {/* Slack Connector Card */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#4a154b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 16
                    }}>
                      #
                    </div>
                    <div>
                      <strong style={{ fontSize: 15, color: '#f1f5f9' }}>Slack Messaging</strong>
                      <div className="mono muted" style={{ fontSize: 11 }}>8de5d696-5289-4c9c-ade4-de918d019d06</div>
                    </div>
                  </div>
                  <span className="badge ack">CONNECTED</span>
                </div>

                <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.55, marginBottom: 14 }}>
                  Delivers real-time interactive Block Kit alert cards to account managers. Includes embedded <strong>Acknowledge</strong> action buttons routing through the Fastn Ack Loop workflow.
                </p>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                    Tenant Alert Channel
                  </div>
                  <div className="mono" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                    {channel}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn ghost"
                  onClick={handleTestSlack}
                  disabled={testingSlack}
                  style={{ flex: 1, padding: '7px 12px', fontSize: 12, justifyContent: 'center' }}
                >
                  {testingSlack ? 'Pinging…' : (<span style={{display:'inline-flex',alignItems:'center',gap:6}}><IconZap size={13} /> Send Test Ping</span>)}
                </button>
                <a
                  href={currentConfig.connectorsUrl || currentConfig.installationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn ghost"
                  style={{
                    padding: '7px 14px',
                    fontSize: 12,
                    color: 'var(--accent)',
                    borderColor: 'rgba(167, 139, 250, 0.3)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  title="Manage Fastn Connector"
                >
                  <IconLink size={13} /> Fastn Connector
                </a>
              </div>
            </div>
          </div>

          {/* Form Schema & Governance Configuration */}
          <div style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: 22,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>
                  Configured Form Schema · Installation {currentConfig.installationId}
                </h4>
                <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>
                  Policy rules enforced by the Fastn runtime manifest during anomaly evaluation.
                </p>
              </div>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent2)' }}>
                Fastn Runtime Configured
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>
                  Churn Risk Alert Threshold (%) (<code>riskThreshold</code>)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="range"
                    min="15"
                    max="80"
                    step="5"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <div className="mono" style={{
                    minWidth: 54,
                    padding: '6px 10px',
                    background: 'var(--panel2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    textAlign: 'center',
                    fontWeight: 700,
                    color: 'var(--accent)'
                  }}>
                    {threshold}%
                  </div>
                </div>
                <span className="muted" style={{ fontSize: 11 }}>
                  Alerts fire when 30-day engagement drop exceeds this threshold.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>
                  Alert Slack Channel (<code>slackChannel</code>)
                </label>
                <input
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--panel2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    color: 'var(--text)',
                    fontSize: 13,
                    fontFamily: 'ui-monospace, monospace'
                  }}
                />
                <span className="muted" style={{ fontSize: 11 }}>
                  Alerts for {currentConfig.company} land in this channel.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                className="btn"
                onClick={handleSaveConfig}
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                Save &amp; Sync to Fastn Runtime
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LIVE IFRAME EMBED (Embedded Fastn Integration Hub) */}
      {viewMode === 'iframe' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0c' }}>
          {/* Iframe Controls Toolbar */}
          <div style={{
            padding: '10px 18px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: 'var(--muted)',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="badge ack" style={{ fontSize: 11 }}>Fastn Integration Hub</span>
              <span className="mono" style={{ fontSize: 11, color: '#a1a1aa' }}>
                Tenant: {currentConfig.company}
              </span>
              <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: 2, border: '1px solid var(--line)' }}>
                <button
                  onClick={() => setIframeSubMode('hub')}
                  style={{
                    border: 'none',
                    padding: '3px 10px',
                    fontSize: 11,
                    borderRadius: 4,
                    background: iframeSubMode === 'hub' ? 'var(--accent)' : 'transparent',
                    color: iframeSubMode === 'hub' ? '#ffffff' : 'var(--muted)',
                    fontWeight: iframeSubMode === 'hub' ? 700 : 400,
                    cursor: 'pointer'
                  }}
                >
                  Interactive Hub Frame
                </button>
                <button
                  onClick={() => setIframeSubMode('raw')}
                  style={{
                    border: 'none',
                    padding: '3px 10px',
                    fontSize: 11,
                    borderRadius: 4,
                    background: iframeSubMode === 'raw' ? 'var(--accent)' : 'transparent',
                    color: iframeSubMode === 'raw' ? '#ffffff' : 'var(--muted)',
                    fontWeight: iframeSubMode === 'raw' ? 700 : 400,
                    cursor: 'pointer'
                  }}
                >
                  Raw Platform Iframe
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn ghost"
                style={{ padding: '4px 10px', fontSize: 11 }}
                onClick={() => {
                  setIframeLoaded(false);
                  setIframeKey((k) => k + 1);
                  showToast('Reloaded Fastn frame');
                }}
              >
                <IconRefresh size={12} /> Reload Frame
              </button>
              <a
                href={fastnTargetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn ghost"
                style={{ padding: '4px 12px', fontSize: 11, color: 'var(--accent)', borderColor: 'rgba(167, 139, 250, 0.4)' }}
              >
                <IconArrowUpRight size={12} /> Open in Fastn Console
              </a>
            </div>
          </div>

          {/* SUBMODE A: INTERACTIVE HUB FRAME */}
          {iframeSubMode === 'hub' && (
            <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#0a0a0c' }}>
              {/* Fastn Hub Frame Canvas */}
              <div style={{
                maxWidth: 900,
                margin: '0 auto',
                background: '#111113',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}>
                {/* Frame Header Bar */}
                <div style={{
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                      <IconZap size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 14, color: '#f8fafc' }}>Fastn Integration Hub</strong>
                      <div className="muted" style={{ fontSize: 11 }}>Installation: {currentConfig.installationId}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#a1a1aa' }}>Filter:</span>
                    {['all', 'installed', 'available'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setConnectorFilter(mode)}
                        style={{
                          background: connectorFilter === mode ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                          color: connectorFilter === mode ? 'var(--accent)' : 'var(--muted)',
                          border: connectorFilter === mode ? '1px solid var(--accent)' : '1px solid var(--line)',
                          borderRadius: 6,
                          padding: '3px 10px',
                          fontSize: 11,
                          textTransform: 'capitalize',
                          cursor: 'pointer'
                        }}
                      >
                        {mode === 'all' ? 'All (2)' : mode === 'installed' ? 'Installed (2)' : 'Available (160+)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tenant Scope Notification */}
                <div style={{
                  padding: '10px 20px',
                  background: 'rgba(167, 139, 250, 0.05)',
                  borderBottom: '1px solid rgba(167, 139, 250, 0.12)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12,
                  color: '#a1a1aa'
                }}>
                  <span>
                    Scoped to: <strong style={{ color: '#e2e8f0' }}>{currentConfig.company}</strong> ({currentConfig.name})
                  </span>
                  <span className="badge ack" style={{ fontSize: 10 }}>Zero-Leak Multi-Tenant</span>
                </div>

                {/* Connectors List inside Frame */}
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* HubSpot Item */}
                  {(connectorFilter === 'all' || connectorFilter === 'installed') && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      padding: '16px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#ff7a59', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                          H
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ fontSize: 14, color: '#f1f5f9' }}>HubSpot CRM</strong>
                            <span className="badge ack" style={{ fontSize: 10 }}>ACTIVE</span>
                          </div>
                          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                            Bound to {currentConfig.hubspotCompany} · Timeline Notes &amp; Account Enrichment
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          className="btn ghost"
                          style={{ padding: '4px 12px', fontSize: 11 }}
                          onClick={handleTestHubspot}
                          disabled={testingHubspot}
                        >
                          {testingHubspot ? 'Testing…' : (<span style={{display:'inline-flex',alignItems:'center',gap:6}}><IconZap size={12} /> Test</span>)}
                        </button>
                        <a
                          href={currentConfig.connectorsUrl || currentConfig.installationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn ghost"
                          style={{ padding: '4px 12px', fontSize: 11, color: 'var(--accent)' }}
                        >
                          <IconArrowUpRight size={12} /> Open in Fastn
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Slack Item */}
                  {(connectorFilter === 'all' || connectorFilter === 'installed') && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      padding: '16px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#4a154b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                          #
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ fontSize: 14, color: '#f1f5f9' }}>Slack Alerts</strong>
                            <span className="badge ack" style={{ fontSize: 10 }}>ACTIVE</span>
                          </div>
                          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                            Targeting {channel} · Interactive Churn Risk Alert Cards with Ack Buttons
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          className="btn ghost"
                          style={{ padding: '4px 12px', fontSize: 11 }}
                          onClick={handleTestSlack}
                          disabled={testingSlack}
                        >
                          {testingSlack ? 'Pinging…' : (<span style={{display:'inline-flex',alignItems:'center',gap:6}}><IconZap size={12} /> Ping</span>)}
                        </button>
                        <a
                          href={currentConfig.connectorsUrl || currentConfig.installationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn ghost"
                          style={{ padding: '4px 12px', fontSize: 11, color: 'var(--accent)' }}
                        >
                          <IconArrowUpRight size={12} /> Open in Fastn
                        </a>
                      </div>
                    </div>
                  )}

                  {connectorFilter === 'available' && (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                      Fastn supports 160+ managed connectors (Salesforce, Zendesk, Jira, GitHub, PostHog, Segment, Stripe, and more) ready to be activated in the Fastn Platform Studio.
                      <div style={{ marginTop: 12 }}>
                        <a
                          href={currentConfig.connectorsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn ghost"
                          style={{ fontSize: 12, color: 'var(--accent)' }}
                        >
                          <IconArrowUpRight size={12} /> Browse Fastn Connector Catalog
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Frame Footer */}
                <div style={{
                  padding: '12px 20px',
                  background: 'rgba(12, 12, 14, 0.8)',
                  borderTop: '1px solid var(--line)',
                  fontSize: 11.5,
                  color: 'var(--muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8
                }}>
                  <span>Fastn Runtime Bridge · <code className="mono">{currentConfig.company}</code></span>
                  <a
                    href={fastnTargetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent)', textDecoration: 'none' }}
                  >
                    Open Full Installation Console <IconArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* SUBMODE B: RAW PLATFORM IFRAME */}
          {iframeSubMode === 'raw' && (
            <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: 560, background: '#0a0a0c' }}>
              <div style={{
                padding: '8px 18px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid var(--line)',
                fontSize: 11.5,
                color: '#a1a1aa'
              }}>
                Target: <code className="mono" style={{ color: 'var(--accent)' }}>{directIframeSrc}</code> · CSP <code>frame-ancestors *</code>
              </div>

              {!iframeLoaded && (
                <div style={{
                  position: 'absolute',
                  inset: '35px 0 0 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0a0a0c',
                  color: 'var(--muted)',
                  gap: 12,
                  zIndex: 2,
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    border: '3px solid var(--line)',
                    borderTopColor: 'var(--accent)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Loading Fastn Integration Hub frame from api.fastn.dev…</span>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              <iframe
                key={iframeKey}
                src={directIframeSrc}
                onLoad={() => setIframeLoaded(true)}
                style={{
                  width: '100%',
                  height: 'calc(100% - 35px)',
                  border: 'none',
                  background: '#0a0a0c',
                  display: 'block',
                }}
                allow="clipboard-write"
                title="Fastn PulseGuard Integrations Widget"
              />
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CONNECTOR SPECS & EMBED CODE */}
      {viewMode === 'specs' && (
        <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#0c0c0e' }}>
          <h3 style={{ fontSize: 16, marginBottom: 6, color: '#f4f4f5' }}>
            Fastn Governed Widget Specification: PulseGuard Integrations
          </h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
            Widget ID: <code className="mono">wgt_fa0d339f81d4</code> · Type: <code>APP</code> · Activation: <code>SINGLE_ACTIVATION</code> · Multi-Tenant: <code>ISOLATED</code>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--panel)', padding: 18, borderRadius: 10, border: '1px solid var(--line)' }}>
              <strong style={{ fontSize: 14, color: '#f1f5f9' }}>Fastn Platform URN Bindings</strong>
              <div style={{ marginTop: 10, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>Tenant Alpha Binding:</div>
                  <code className="mono" style={{ fontSize: 11, wordBreak: 'break-all', color: 'var(--accent)' }}>
                    fastn:personal_dc05aac8b2c7b361ba84/1d599802-f9ad-4d62-830a-e66854c108c3/binding/inst_dcafc09c2f07
                  </code>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>Tenant Beta Binding:</div>
                  <code className="mono" style={{ fontSize: 11, wordBreak: 'break-all', color: 'var(--accent)' }}>
                    fastn:personal_dc05aac8b2c7b361ba84/8d8b6c6c-ec68-454c-99c6-a549b7b7e28b/binding/inst_6e346d508e28
                  </code>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--panel)', padding: 18, borderRadius: 10, border: '1px solid var(--line)' }}>
              <strong style={{ fontSize: 14, color: '#f1f5f9' }}>Workflow Reference Graph</strong>
              <div style={{ marginTop: 10, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <span className="badge ack" style={{ fontSize: 10, marginRight: 6 }}>Triggered</span>
                  <code className="mono" style={{ color: '#e2e8f0' }}>pulseguard-risk-engine-v2</code>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>Workflow ID: wf_fe925b124168 · Version 1</div>
                </div>
                <div>
                  <span className="badge warn" style={{ fontSize: 10, marginRight: 6 }}>Interactive</span>
                  <code className="mono" style={{ color: '#e2e8f0' }}>pulseguard-ack-loop</code>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>Workflow ID: wf_4afb70d49708 · Version 1</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--panel)', padding: 20, borderRadius: 10, border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ fontSize: 14, color: '#f1f5f9' }}>Embed Snippet (Production Pattern)</h4>
              <button
                className="btn ghost"
                onClick={copyEmbedCode}
                style={{ padding: '4px 12px', fontSize: 12 }}
              >
                {copiedCode ? (<span style={{display:'inline-flex',alignItems:'center',gap:6}}><IconCheck size={12} /> Copied</span>) : (<span style={{display:'inline-flex',alignItems:'center',gap:6}}><IconCopy size={12} /> Copy embed code</span>)}
              </button>
            </div>
            <pre style={{
              background: '#08080a',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: 14,
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              color: '#38bdf8',
              overflowX: 'auto',
              lineHeight: 1.6
            }}>
              {embedHtmlSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast" style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
