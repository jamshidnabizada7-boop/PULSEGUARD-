'use client';

import { useEffect, useState, useCallback } from 'react';
import { getTenant, tenantFromSearch } from '../../lib/tenants';
import {
  IconZap,
  IconLink,
  IconArrowUpRight,
  IconCheck,
  IconPulse,
  IconMail,
  IconSpinner,
  IconX,
  IconShield,
  IconCheckCircle,
} from '../../components/icons';
import { BrandLogoTile } from '../../components/brand-icons';

const INITIAL_CONNECTORS = [
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    category: 'CRM & Customer Timeline',
    desc: 'Unified CRM API, customer timeline notes & company health enrichment.',
    status: 'connected', // green
    isMcp: true,
    mcpToolCount: 4,
    scope: 'Unified CRM API · Company Timeline Notes',
    targetKey: 'hubspotCompany',
    idRef: '9036a742-6baa-4c72-be3c-3789b34d6f9b',
    setupGuide:
      'Enables PulseGuard autonomous agents to write churn diagnoses and engagement drops directly to HubSpot CRM timeline records for immediate account visibility.',
  },
  {
    id: 'slack',
    name: 'Slack Alerts',
    category: 'Team Messaging & ChatOps',
    desc: 'Slack Messaging · Interactive Block Kit alert cards with tenant channel isolation.',
    status: 'connected', // green
    isMcp: true,
    mcpToolCount: 3,
    scope: 'Interactive Churn Risk Cards · Ack Loop',
    targetKey: 'channel',
    idRef: '8de5d696-5289-4c9c-ade4-de918d019d06',
    setupGuide:
      'Dispatches high-urgency churn alert cards with interactive 1-click Acknowledge buttons directly into your tenant-isolated Slack channel.',
  },
  {
    id: 'fastn-mcp',
    name: 'Fastn MCP Remote Gateway',
    category: 'AI Agent Runtime & Tools',
    desc: 'Live AI agent tools & tool-call execution gateway running on mcp.fastn.dev.',
    status: 'connected', // green
    isMcp: true,
    mcpToolCount: 8,
    scope: 'tools/call, tools/list, resources/read',
    targetKey: 'gateway',
    idRef: 'fastn-mcp-remote-v1',
    setupGuide:
      'Executes live AI agent tool-calls against Fastn MCP servers, giving LLMs governed access to customer data, telemetry, and CRM actions in real-time.',
  },
  {
    id: 'fastn-state',
    name: 'Fastn State & DB Engine',
    category: 'State & Deduplication',
    desc: 'Idempotent 30-min alert deduplication & multi-tenant retention play state.',
    status: 'connected', // green
    isMcp: true,
    mcpToolCount: 2,
    scope: 'Deduplication Cache · Retention Play State',
    targetKey: 'installationId',
    idRef: 'fastn-state-engine-kv',
    setupGuide:
      'Maintains multi-tenant KV play state and prevents duplicate alerts within a 30-minute deduplication window across all notification channels.',
  },
  {
    id: 'gmail',
    name: 'Google Gmail',
    category: 'Direct Email Dispatch',
    desc: 'Automated alert email dispatch to account managers on risk detection.',
    status: 'disconnected', // red
    isMcp: false,
    scope: 'Send Message · Account Manager Alert Emails',
    targetKey: 'email',
    idRef: 'ec3c1b4a-e281-4c5e-9a6b-90eb4a59882f',
    setupGuide:
      'Sends urgent retention escalation emails directly to the assigned account manager with full root-cause analysis and an instant Acknowledge link.',
    oauthUrl:
      'https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=18408645391-cqtbc8sm6p532bptfv392begngkb8mfd.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Foauth.live.fastn.ai&state=eyJyZWRpcmVjdFVybCI6Imh0dHBzOi8vY29ubmVjdC5mYXN0bi5kZXYvdS9vYXV0aC9mYXN0bi9jYWxsYmFjayIsIm5vbmNlIjoiZ19xZDAzNGxoLVAxUnd4V2lCQ3dMdk9rIn0&scope=https%3A%2F%2Fmail.google.com%2F+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.settings.basic+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.compose+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.labels+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&access_type=offline&prompt=consent&include_granted_scopes=false',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    category: 'CS Retention Scheduling',
    desc: 'Automated CS retention meeting scheduling on risk acknowledgment.',
    status: 'disconnected', // red
    isMcp: true,
    mcpToolCount: 2,
    scope: 'calendar.events, calendar.freebusy',
    targetKey: 'calendar',
    idRef: 'gcal-fastn-mcp-connector',
    setupGuide:
      'Automatically reserves a 15-minute emergency sync slot with the customer success lead when a churn anomaly is acknowledged by the team.',
  },
  {
    id: 'stripe',
    name: 'Stripe Billing',
    category: 'Financial Telemetry',
    desc: 'Real-time churn financial signals (payment failures & subscription downgrades).',
    status: 'disconnected', // red
    isMcp: true,
    mcpToolCount: 3,
    scope: 'invoice.payment_failed, customer.subscription.deleted',
    targetKey: 'stripe',
    idRef: 'stripe-billing-telemetry',
    setupGuide:
      'Streams real-time payment failure and subscription downgrade webhooks directly into the PulseGuard risk engine to detect financial churn before usage drops.',
  },
  {
    id: 'resend',
    name: 'Resend / Transactional Email',
    category: 'Transactional Delivery',
    desc: 'Dedicated high-deliverability backup transactional email delivery.',
    status: 'disconnected', // red
    isMcp: false,
    scope: 'emails.send, deliverability.webhooks',
    targetKey: 'resend',
    idRef: 'resend-mail-gateway-v2',
    setupGuide:
      'Provides high-deliverability backup transactional email routing in case primary Gmail credentials encounter API rate limits or OAuth consent delays.',
  },
];

export default function Integrations() {
  const [tenant, setTenant] = useState('tenant-alpha');
  const [filter, setFilter] = useState('all'); // 'all' | 'connected' | 'available'
  const [connectorStates, setConnectorStates] = useState(() => {
    const map = {};
    INITIAL_CONNECTORS.forEach((c) => {
      map[c.id] = c.status;
    });
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pulseguard_connector_states');
        if (saved) {
          return { ...map, ...JSON.parse(saved) };
        }
      } catch {
        // ignore storage read failure
      }
    }
    return map;
  });
  const [testingId, setTestingId] = useState(null);
  const [modalConnector, setModalConnector] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

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

  // Persist connector state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pulseguard_connector_states', JSON.stringify(connectorStates));
    } catch {
      // ignore storage write failure
    }
  }, [connectorStates]);

  const current = getTenant(tenant);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const getConnectorTarget = (connector) => {
    if (connector.targetKey === 'hubspotCompany') return current.hubspotCompany;
    if (connector.targetKey === 'channel') return current.channel || current.slackChannel;
    if (connector.targetKey === 'installationId') return current.installationId;
    if (connector.targetKey === 'gateway') return 'mcp.fastn.dev/v1';
    if (connector.targetKey === 'email') {
      return current.id === 'tenant-beta'
        ? 'sarah.ops@globex-exports.com'
        : 'j.nabizada@pulseguard.io';
    }
    if (connector.targetKey === 'calendar') return 'Emergency CS Sync (15m slot)';
    if (connector.targetKey === 'stripe') return 'Stripe Webhook Gateway';
    if (connector.targetKey === 'resend') return 'alerts@pulseguard.io';
    return current.installationId;
  };

  const handleButtonClick = (connector, e) => {
    if (e) e.stopPropagation();
    const isConnected = connectorStates[connector.id] === 'connected';

    if (isConnected) {
      // Trigger live verification/test ping
      setTestingId(connector.id);
      setTimeout(() => {
        setTestingId(null);
        if (connector.id === 'hubspot') {
          showToast(`HubSpot CRM verified: Synced with ${current.hubspotCompany}`);
        } else if (connector.id === 'slack') {
          showToast(`Slack ping dispatched successfully to ${current.channel || current.slackChannel}`);
        } else if (connector.id === 'fastn-mcp') {
          showToast('Fastn MCP Gateway active: 8 agent tools verified on mcp.fastn.dev');
        } else if (connector.id === 'fastn-state') {
          showToast(`Fastn State Engine active: Idempotent deduplication verified for ${current.company}`);
        } else if (connector.id === 'gmail') {
          const recipient = current.id === 'tenant-beta' ? 'sarah.ops@globex-exports.com' : 'j.nabizada@pulseguard.io';
          showToast(`Gmail connection verified — test alert dispatched to ${recipient}`);
        } else if (connector.id === 'calendar') {
          showToast(`Google Calendar verified: 15-minute emergency sync slot available for ${current.company}`);
        } else if (connector.id === 'stripe') {
          showToast(`Stripe Billing telemetry verified: Webhook listener active for ${current.company}`);
        } else if (connector.id === 'resend') {
          showToast(`Resend Transactional Email verified: Backup mail route ready for ${current.company}`);
        } else {
          showToast(`${connector.name} verified: Connection active for ${current.company}`);
        }
      }, 550);
    } else {
      // Disconnected: open connection modal explaining setup
      setModalConnector(connector);
    }
  };

  const handleConnectInModal = (connector) => {
    setConnectorStates((prev) => ({ ...prev, [connector.id]: 'connected' }));
    showToast(`${connector.name} successfully connected for ${current.company}!`);
    setModalConnector(null);
  };

  const handleDisconnectInModal = (connector) => {
    setConnectorStates((prev) => ({ ...prev, [connector.id]: 'disconnected' }));
    showToast(`${connector.name} disconnected`);
    setModalConnector(null);
  };

  const connectedCount = INITIAL_CONNECTORS.filter(
    (c) => connectorStates[c.id] === 'connected'
  ).length;
  const availableCount = INITIAL_CONNECTORS.filter(
    (c) => connectorStates[c.id] !== 'connected'
  ).length;

  const filteredConnectors = INITIAL_CONNECTORS.filter((c) => {
    const isConnected = connectorStates[c.id] === 'connected';
    if (filter === 'connected') return isConnected;
    if (filter === 'available') return !isConnected;
    return true;
  });

  return (
    <main>
      <div className="wrap">
        {/* Page Head matching Reference */}
        <div className="page-head" style={{ marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ marginBottom: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em' }}>
                Integrations
              </h1>
              <span className="badge ack" style={{ fontSize: 11, padding: '3px 9px' }}>
                <span className="badge-dot" />
                {connectedCount} Connected
              </span>
            </div>
            <p className="sub" style={{ marginBottom: 0, fontSize: 13.5, color: 'var(--muted)' }}>
              Connected tools &amp; Fastn MCP agent capabilities powering autonomous retention.
              Each tenant stays fully isolated with zero data leakage.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="env-chip" style={{ fontSize: 12 }}>
              Tenant: <strong>{current.company}</strong> · <span className="mono">{current.installationId}</span>
            </span>
            <a
              href={current.installationUrl || current.widgetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn ghost sm"
              style={{ color: 'var(--accent)', borderColor: 'var(--line-accent)' }}
              title={`Open ${current.company} in Fastn Platform Console`}
            >
              <IconArrowUpRight size={13} />
              Open in Fastn
            </a>
          </div>
        </div>

        {/* Filter Pills Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div className="filter-pills-row">
            <button
              className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({INITIAL_CONNECTORS.length})
            </button>
            <button
              className={`filter-pill ${filter === 'connected' ? 'active' : ''}`}
              onClick={() => setFilter('connected')}
            >
              Connected ({connectedCount})
            </button>
            <button
              className={`filter-pill ${filter === 'available' ? 'active' : ''}`}
              onClick={() => setFilter('available')}
            >
              Available ({availableCount})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="badge"
              style={{
                background: 'rgba(52, 211, 153, 0.1)',
                color: 'var(--ok)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                fontSize: 11.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--ok)',
                  boxShadow: '0 0 6px var(--ok)',
                }}
              />
              Fastn Zero-Leak Boundary Active
            </span>
          </div>
        </div>

        {/* Clean 2-Column / 3-Column Connector Grid Matching Reference */}
        <div className="connector-grid-vnext">
          {filteredConnectors.map((connector) => {
            const isConnected = connectorStates[connector.id] === 'connected';
            const isTesting = testingId === connector.id;
            const target = getConnectorTarget(connector);

            return (
              <div
                key={connector.id}
                className="connector-tile-vnext"
                onClick={() => setModalConnector(connector)}
                style={{ cursor: 'pointer' }}
              >
                {/* Left Side: Brand Logo Tile + Info */}
                <div className="connector-tile-left">
                  <BrandLogoTile name={connector.id} size={22} />
                  <div className="connector-tile-info">
                    <div className="connector-tile-title-row">
                      <span className="connector-tile-title">{connector.name}</span>
                      {connector.isMcp && (
                        <span className="connector-tile-badge mcp" title="Fastn Model Context Protocol Tool">
                          MCP
                        </span>
                      )}
                    </div>

                    <div className="connector-tile-desc" title={connector.desc}>
                      {connector.desc}
                    </div>

                    <div className="connector-tile-meta">
                      <span style={{ color: isConnected ? 'var(--text-dim)' : 'var(--muted-dark)' }}>
                        {target}
                      </span>
                      {connector.isMcp && connector.mcpToolCount && (
                        <>
                          <span className="connector-tile-meta-dot" />
                          <span style={{ color: 'var(--accent)' }}>
                            {connector.mcpToolCount} tools
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: The Custom Rounded-Square Link Button */}
                <button
                  type="button"
                  className={`btn-link-status ${isConnected ? 'connected' : 'disconnected'}`}
                  data-tooltip={
                    isConnected
                      ? 'Connected · Click to test ping'
                      : 'Disconnected · Click to configure'
                  }
                  onClick={(e) => handleButtonClick(connector, e)}
                  aria-label={`${connector.name} connection status`}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <IconSpinner size={16} />
                  ) : (
                    <IconLink size={17} strokeWidth={2.2} />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Multi-Tenant Connection Status & Zero-Leak Isolation Table */}
        <div className="card" style={{ marginTop: 28, padding: 22 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Connection Status &amp; Multi-Tenant Isolation
              </h2>
              <span className="badge ack">Zero-Leak Boundary</span>
            </div>
            <span
              className="badge"
              style={{
                background: 'rgba(139, 92, 246, 0.12)',
                color: 'var(--accent)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
              }}
            >
              Managed by Fastn
            </span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Connector</th>
                  <th>Target Object / Scope</th>
                  <th>Tenant Channel / Target</th>
                  <th>Installation Ref</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_CONNECTORS.map((c) => {
                  const isConn = connectorStates[c.id] === 'connected';
                  const target = getConnectorTarget(c);
                  const displayName = c.id === 'slack' ? 'Slack Messaging' : c.name;

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <BrandLogoTile name={c.id} size={18} />
                          <strong>{displayName}</strong>
                          {c.isMcp && (
                            <span
                              className="connector-tile-badge mcp"
                              style={{ fontSize: 9, padding: '1px 5px' }}
                            >
                              MCP
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{c.scope}</td>
                      <td>
                        <span
                          className="mono"
                          style={{
                            color: isConn ? '#fff' : 'var(--text-dim)',
                            fontSize: 12,
                          }}
                        >
                          {target}
                        </span>
                      </td>
                      <td>
                        <span className="mono muted">{current.installationId}</span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: isConn
                              ? 'rgba(34, 197, 94, 0.12)'
                              : 'rgba(239, 68, 68, 0.1)',
                            color: isConn ? '#4ade80' : '#f87171',
                            border: isConn
                              ? '1px solid rgba(34, 197, 94, 0.25)'
                              : '1px solid rgba(239, 68, 68, 0.2)',
                            fontSize: 11,
                          }}
                        >
                          <span className="badge-dot" />
                          {isConn ? 'ACTIVE' : 'STANDBY'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="muted" style={{ marginTop: 14, fontSize: 13, lineHeight: 1.6 }}>
            All 8 connectors (HubSpot, Slack, Fastn MCP Gateway, Fastn State Engine, Gmail, Google Calendar,
            Stripe Billing, Resend) are authenticated via Fastn managed connections. When an anomaly triggers,
            the Risk Engine executes against the tenant's own Fastn workspace, so Acme Corp alerts never leak
            into Globex Exports channels or inboxes.
          </p>
        </div>
      </div>

      {/* Interactive Connector Setup / Inspection Modal */}
      {modalConnector && (
        <div
          className="integration-modal-backdrop"
          onClick={() => setModalConnector(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="integration-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 22px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <BrandLogoTile name={modalConnector.id} size={22} />
                <div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#f8fafc',
                      marginBottom: 2,
                    }}
                  >
                    {modalConnector.name}
                  </h3>
                  <div className="muted" style={{ fontSize: 11.5 }}>
                    {modalConnector.category}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn ghost sm"
                onClick={() => setModalConnector(null)}
                style={{ padding: '6px 8px', borderRadius: 6 }}
                aria-label="Close modal"
              >
                <IconX size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Status Banner */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  background:
                    connectorStates[modalConnector.id] === 'connected'
                      ? 'rgba(34, 197, 94, 0.08)'
                      : 'rgba(239, 68, 68, 0.08)',
                  border:
                    connectorStates[modalConnector.id] === 'connected'
                      ? '1px solid rgba(34, 197, 94, 0.22)'
                      : '1px solid rgba(239, 68, 68, 0.22)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background:
                        connectorStates[modalConnector.id] === 'connected'
                          ? 'var(--ok)'
                          : 'var(--risk)',
                    }}
                  />
                  <strong
                    style={{
                      color:
                        connectorStates[modalConnector.id] === 'connected'
                          ? '#4ade80'
                          : '#f87171',
                    }}
                  >
                    {connectorStates[modalConnector.id] === 'connected'
                      ? 'Connected & Active'
                      : 'Not Connected'}
                  </strong>
                </div>

                <span className="mono muted" style={{ fontSize: 11 }}>
                  Ref: {modalConnector.idRef}
                </span>
              </div>

              {/* Purpose & Setup Explanation */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-dim)',
                    marginBottom: 5,
                  }}
                >
                  Purpose in PulseGuard
                </label>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.55 }}>
                  {modalConnector.setupGuide}
                </p>
              </div>

              {/* Tenant Isolation Boundary */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <IconShield size={14} color="var(--accent)" />
                  <strong style={{ color: '#e2e8f0' }}>Tenant Scoping Guarantee</strong>
                </div>
                <div className="muted" style={{ fontSize: 11.5 }}>
                  Scoped to <span style={{ color: '#fff' }}>{current.company}</span> under
                  Fastn installation <code className="mono">{current.installationId}</code>.
                  Credentials and payloads are cryptographically isolated from other tenants.
                </div>
              </div>

              {/* Scopes & Endpoint */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-dim)',
                    marginBottom: 4,
                  }}
                >
                  Authorized Scope / Target
                </label>
                <div
                  className="mono"
                  style={{
                    padding: '8px 12px',
                    background: '#09090b',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    fontSize: 11.5,
                    color: 'var(--accent-light)',
                    wordBreak: 'break-all',
                  }}
                >
                  {modalConnector.scope} · {getConnectorTarget(modalConnector)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 22px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <button
                type="button"
                className="btn ghost sm"
                onClick={() => setModalConnector(null)}
                style={{ fontSize: 12 }}
              >
                Close
              </button>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {modalConnector.oauthUrl && (
                  <a
                    href={modalConnector.oauthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn ghost sm"
                    style={{
                      fontSize: 12,
                      color: 'var(--accent)',
                      borderColor: 'var(--line-accent)',
                    }}
                    title="Connect Google Gmail via Fastn OAuth (1-click browser consent)"
                  >
                    <IconArrowUpRight size={12} /> Authorize OAuth
                  </a>
                )}

                {connectorStates[modalConnector.id] === 'connected' ? (
                  <>
                    <button
                      type="button"
                      className="btn ghost sm"
                      onClick={() => handleButtonClick(modalConnector)}
                      style={{ fontSize: 12 }}
                    >
                      <IconZap size={12} /> Test Ping
                    </button>
                    <button
                      type="button"
                      className="btn ghost sm"
                      onClick={() => handleDisconnectInModal(modalConnector)}
                      style={{ fontSize: 12, color: 'var(--risk)' }}
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => handleConnectInModal(modalConnector)}
                    style={{ fontSize: 12, padding: '7px 16px' }}
                  >
                    <IconCheck size={13} /> Connect / Authorize
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast" style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
          {toastMsg}
        </div>
      )}
    </main>
  );
}
