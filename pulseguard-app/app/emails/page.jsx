'use client';
import { useState, useEffect, useCallback } from 'react';
import { getTenant, tenantFromSearch, pushTenant, TENANT_LIST } from '../../lib/tenants';
import { BrandLogo, BrandLogoTile } from '../../components/brand-icons';
import {
  IconMail,
  IconRefresh,
  IconCheck,
  IconCopy,
  IconZap,
  IconSpinner,
  IconArrowUpRight,
  IconX,
} from '../../components/icons';

function formatRelativeTime(isoString) {
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

export default function EmailsPage() {
  const [tenant, setTenant] = useState('all');
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'delivered' | 'sent' | 'failed'
  const [search, setSearch] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'html'
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const syncTenantFromUrl = useCallback(() => {
    setTenant(tenantFromSearch('all'));
  }, []);

  useEffect(() => {
    setMounted(true);
    syncTenantFromUrl();
    window.addEventListener('popstate', syncTenantFromUrl);
    window.addEventListener('tenantchange', syncTenantFromUrl);
    return () => {
      window.removeEventListener('popstate', syncTenantFromUrl);
      window.removeEventListener('tenantchange', syncTenantFromUrl);
    };
  }, [syncTenantFromUrl]);

  const fetchEmails = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (tenant !== 'all') p.set('tenant', tenant);
      if (filter !== 'all') p.set('status', filter);
      if (search.trim()) p.set('search', search.trim());

      const res = await fetch(`/api/emails?${p.toString()}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.emails)) {
        setEmails(data.emails);
        // Automatically select the first email if none is selected
        setSelectedEmail((prev) => {
          if (!prev) return data.emails[0] || null;
          const found = data.emails.find((e) => e.id === prev.id);
          return found || data.emails[0] || null;
        });
      }
    } catch (e) {
      console.error('Failed to fetch emails:', e);
    } finally {
      setLoading(false);
    }
  }, [tenant, filter, search]);

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 6000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  const handleTenantChange = (next) => {
    setTenant(next);
    pushTenant(next);
  };

  const handleCopyHtml = () => {
    if (!selectedEmail?.html) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(selectedEmail.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulateSend = async () => {
    setSimulating(true);
    const targetTenant = tenant === 'tenant-beta' ? 'tenant-beta' : 'tenant-alpha';
    const t = getTenant(targetTenant);
    try {
      await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: targetTenant,
          to: targetTenant === 'tenant-beta' ? 'sarah.ops@globex-exports.com' : 'j.nabizada@pulseguard.io',
          from: 'PulseGuard Alerts <alerts@pulseguard.io>',
          subject: `[PulseGuard] Churn risk: ${t.company} — usage down ${t.dropPct}%`,
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1e293b; border-radius: 8px; border: 1px solid #e2e8f0;">
  <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 20px;">
    <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #ef4444;">PulseGuard Retention Alert</span>
    <h2 style="margin: 6px 0 0; font-size: 20px; color: #0f172a;">Churn risk detected for ${t.company}</h2>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #334155;">
    Telemetry analysis indicates that <strong>${t.company}</strong> weekly usage dropped by <strong style="color: #dc2626;">${t.dropPct}%</strong> this week. Health score: <strong>${t.dropHealth}/100</strong>.
  </p>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; margin: 18px 0;">
    <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 4px;">SIGNAL TRACE</div>
    <div style="font-size: 13.5px; color: #1e293b;">Automated anomaly alert for account manager review.</div>
  </div>
  <div style="margin: 24px 0 16px;">
    <a href="https://pulseguard-app-nu.vercel.app/api/ack?tenant=${targetTenant}&customer=${encodeURIComponent(t.company)}&by=Email" style="display: inline-block; background: #4F46E5; color: #ffffff; font-size: 13.5px; font-weight: 600; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
      Acknowledge risk &rarr;
    </a>
  </div>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 14px;" />
  <p style="font-size: 11.5px; color: #94a3b8; margin: 0;">
    Dispatched by Fastn Workflow pulseguard-risk-engine-v3 via Google Gmail connector.
  </p>
</div>`,
          status: 'sent',
          sentAt: new Date().toISOString(),
        }),
      });
      await fetchEmails();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <main>
      <div className="wrap">
        {/* Page Head */}
        <div className="page-head">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ marginBottom: 0 }}>Emails</h1>
              <span className="badge ack">
                <span className="badge-dot" />
                Google Gmail
              </span>
            </div>
            <p className="sub" style={{ marginBottom: 0 }}>
              Every alert email PulseGuard sent. Operations audit log for account-manager outreach
              and delivery traces.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn ghost" onClick={fetchEmails} style={{ fontSize: 13, padding: '8px 14px' }}>
              <IconRefresh size={14} />
              Refresh
            </button>
            <button
              className="btn btn-simulate"
              onClick={handleSimulateSend}
              disabled={simulating}
              style={{ fontSize: 13 }}
            >
              {simulating ? (
                <>
                  <IconSpinner size={14} />
                  <span>Dispatching…</span>
                </>
              ) : (
                <>
                  <IconMail size={14} />
                  <span>Send Test Alert</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toolbar: Search + Filter Chips + Tenant Selector */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: 260, maxWidth: 380, flex: 1 }}>
              <input
                type="text"
                placeholder="Search by recipient or subject…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  color: 'var(--text)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted-dark)',
                  display: 'flex',
                }}
              >
                <IconMail size={14} />
              </span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                  }}
                >
                  <IconX size={12} />
                </button>
              )}
            </div>

            {/* Segmented Filter */}
            <div className="seg">
              {['all', 'delivered', 'sent', 'failed'].map((st) => (
                <button
                  key={st}
                  className={`seg-btn ${filter === st ? 'active' : ''}`}
                  onClick={() => setFilter(st)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Tenant Switcher Filter */}
          <div className="seg">
            {[
              ['all', 'All tenants'],
              ['tenant-alpha', 'Alpha'],
              ['tenant-beta', 'Beta'],
            ].map(([id, label]) => (
              <button
                key={id}
                className={`seg-btn ${tenant === id ? 'active' : ''}`}
                onClick={() => handleTenantChange(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area: Split View Table + Detail Pane */}
        <div className={`email-split-layout ${!selectedEmail ? 'no-detail' : ''}`}>
          {/* Email Table Card */}
          <div className="card email-table-card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                <IconSpinner size={18} />
                <div style={{ marginTop: 8 }}>Loading email log…</div>
              </div>
            ) : emails.length === 0 ? (
              <div className="empty-state" style={{ padding: '48px 24px' }}>
                <span className="empty-icon">
                  <IconMail size={24} />
                </span>
                <div className="empty-title">No emails found</div>
                <div className="empty-sub">
                  {search || filter !== 'all'
                    ? 'No alert emails match the current filters. Try clearing your search.'
                    : 'Trigger an anomaly to see the first alert email sent to an account manager.'}
                </div>
                <button
                  className="btn btn-simulate"
                  onClick={handleSimulateSend}
                  disabled={simulating}
                  style={{ marginTop: 14 }}
                >
                  <IconMail size={14} />
                  Send Test Alert
                </button>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="email-table">
                  <thead>
                    <tr>
                      <th style={{ width: '32%' }}>TO</th>
                      <th style={{ width: '18%' }}>STATUS</th>
                      <th>SUBJECT</th>
                      <th style={{ width: '16%', textAlign: 'right' }}>SENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((e) => {
                      const isSelected = selectedEmail?.id === e.id;
                      const statusClass =
                        e.status === 'delivered' ? 'ok' : e.status === 'failed' ? 'risk' : 'healthy';

                      return (
                        <tr
                          key={e.id}
                          onClick={() => setSelectedEmail(e)}
                          className={`email-row ${isSelected ? 'selected' : ''}`}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 6,
                                  background: '#FFFFFF',
                                  padding: 3,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <BrandLogo name="gmail" size={14} />
                              </div>
                              <span
                                className="mono"
                                style={{
                                  fontSize: 12.5,
                                  color: isSelected ? 'var(--text)' : 'var(--text-dim)',
                                  fontWeight: isSelected ? 600 : 400,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: 200,
                                }}
                              >
                                {e.to}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${statusClass}`} style={{ textTransform: 'capitalize' }}>
                              <span className="badge-dot" />
                              {e.status}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                color: isSelected ? '#FFFFFF' : 'var(--text)',
                                fontWeight: isSelected ? 600 : 450,
                                fontSize: 13,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 280,
                              }}
                              title={e.subject}
                            >
                              {e.subject}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span
                              className="mono muted"
                              style={{ fontSize: 11.5 }}
                              title={e.sentAt ? new Date(e.sentAt).toLocaleString() : ''}
                            >
                              {mounted ? formatRelativeTime(e.sentAt) : 'recently'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Email Detail Pane */}
          {selectedEmail && (
            <div className="card email-detail-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Detail Header */}
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--line)',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 650,
                      color: 'var(--text)',
                      marginBottom: 6,
                      lineHeight: 1.35,
                    }}
                  >
                    {selectedEmail.subject}
                  </h3>
                  <span
                    className={`badge ${
                      selectedEmail.status === 'delivered'
                        ? 'ok'
                        : selectedEmail.status === 'failed'
                        ? 'risk'
                        : 'healthy'
                    }`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    <span className="badge-dot" />
                    {selectedEmail.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '4px 12px',
                    fontSize: 12,
                    color: 'var(--muted)',
                    marginTop: 8,
                  }}
                >
                  <span style={{ color: 'var(--muted-dark)' }}>To:</span>
                  <span className="mono" style={{ color: 'var(--text)' }}>
                    {selectedEmail.to}
                  </span>
                  <span style={{ color: 'var(--muted-dark)' }}>From:</span>
                  <span className="mono" style={{ color: 'var(--text-dim)' }}>
                    {selectedEmail.from || 'PulseGuard Alerts <alerts@pulseguard.io>'}
                  </span>
                  <span style={{ color: 'var(--muted-dark)' }}>Sent:</span>
                  <span className="mono" style={{ color: 'var(--text-dim)' }}>
                    {selectedEmail.sentAt ? new Date(selectedEmail.sentAt).toLocaleString() : 'N/A'}
                  </span>
                  <span style={{ color: 'var(--muted-dark)' }}>Channel:</span>
                  <span>
                    Google Gmail connector (<code className="mono">ec3c1b4a-e281-4c5e-9a6b-90eb4a59882f</code>)
                  </span>
                </div>
              </div>

              {/* Delivery Stepper */}
              <div
                style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--line)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'rgba(74, 222, 128, 0.15)',
                        color: 'var(--ok)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                      }}
                    >
                      <IconCheck size={11} />
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>Sent</span>
                    <span className="mono muted" style={{ fontSize: 11 }}>
                      {selectedEmail.sentAt ? new Date(selectedEmail.sentAt).toLocaleTimeString() : ''}
                    </span>
                  </div>

                  <span style={{ width: 24, height: 1, background: 'var(--line-strong)' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background:
                          selectedEmail.status === 'delivered'
                            ? 'rgba(74, 222, 128, 0.15)'
                            : selectedEmail.status === 'failed'
                            ? 'rgba(248, 113, 113, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                        color:
                          selectedEmail.status === 'delivered'
                            ? 'var(--ok)'
                            : selectedEmail.status === 'failed'
                            ? 'var(--risk)'
                            : 'var(--muted-dark)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                      }}
                    >
                      {selectedEmail.status === 'failed' ? <IconX size={11} /> : <IconCheck size={11} />}
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          selectedEmail.status === 'delivered'
                            ? 'var(--text)'
                            : selectedEmail.status === 'failed'
                            ? 'var(--risk)'
                            : 'var(--muted)',
                      }}
                    >
                      {selectedEmail.status === 'failed' ? 'Failed' : 'Delivered'}
                    </span>
                    <span className="mono muted" style={{ fontSize: 11 }}>
                      {selectedEmail.status === 'failed'
                        ? 'delivery rejected'
                        : selectedEmail.deliveredAt
                        ? new Date(selectedEmail.deliveredAt).toLocaleTimeString()
                        : selectedEmail.status === 'delivered'
                        ? 'confirmed'
                        : '~30s estimate'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--muted-dark)' }}>
                  Delivery estimate derived via Fastn 30s confirmation window. Google Gmail connector
                  operates without incoming webhooks.
                </div>
              </div>

              {/* Tabs: Preview vs HTML */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 20px',
                  borderBottom: '1px solid var(--line)',
                  background: 'rgba(0, 0, 0, 0.2)',
                }}
              >
                <div className="seg">
                  <button
                    className={`seg-btn ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                  >
                    Preview
                  </button>
                  <button
                    className={`seg-btn ${activeTab === 'html' ? 'active' : ''}`}
                    onClick={() => setActiveTab('html')}
                  >
                    HTML
                  </button>
                </div>

                {activeTab === 'html' && (
                  <button className="btn ghost sm" onClick={handleCopyHtml}>
                    {copied ? (
                      <>
                        <IconCheck size={12} style={{ color: 'var(--ok)' }} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <IconCopy size={12} />
                        <span>Copy HTML</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Tab Body */}
              <div style={{ padding: 18, background: '#0a0a0c' }}>
                {activeTab === 'preview' ? (
                  <iframe
                    srcDoc={selectedEmail.html}
                    title="Email Preview"
                    sandbox="allow-same-origin allow-popups"
                    style={{
                      width: '100%',
                      height: 420,
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      background: '#FFFFFF',
                      display: 'block',
                    }}
                  />
                ) : (
                  <pre
                    style={{
                      margin: 0,
                      padding: 16,
                      background: '#0e0e11',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      color: 'var(--accent-light)',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 12,
                      lineHeight: 1.6,
                      maxHeight: 420,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {selectedEmail.html}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
