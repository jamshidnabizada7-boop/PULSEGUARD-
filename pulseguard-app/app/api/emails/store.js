// Shared in-memory store for PulseGuard email operations
// Pre-seeded with realistic demo alert emails for Tenant Alpha and Tenant Beta.
// Status automatically upgrades from 'sent' to 'delivered' after 30s.

let emailsStore = [
  {
    id: 'eml-live-001',
    tenant: 'tenant-alpha',
    endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
    to: 'j.nabizada@pulseguard.io',
    from: 'PulseGuard Alerts <alerts@pulseguard.io>',
    subject: '[PulseGuard] Churn risk: Acme Corp — usage down 52%',
    status: 'delivered',
    sentAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    deliveredAt: new Date(Date.now() - 1000 * 60 * 17.5).toISOString(),
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1e293b; border-radius: 8px; border: 1px solid #e2e8f0;">
  <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 20px;">
    <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #ef4444;">PulseGuard Retention Alert</span>
    <h2 style="margin: 6px 0 0; font-size: 20px; color: #0f172a;">Churn risk detected for Acme Corp</h2>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #334155;">
    Telemetry analysis indicates that <strong>Acme Corp</strong> (<code>probe-acme-001</code>) weekly usage dropped by <strong style="color: #dc2626;">52%</strong> this week. Current health score is <strong>38/100</strong>.
  </p>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; margin: 18px 0;">
    <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 4px;">TELEMETRY SIGNAL SUMMARY</div>
    <div style="font-size: 13.5px; color: #1e293b;">Sessions down 52% WoW across all product seats. Admin logins dormant for 6 days.</div>
  </div>
  <p style="font-size: 13.5px; color: #475569;">
    A risk note has been attached to the Acme Corp HubSpot CRM company timeline, and an alert card was posted to <code>#pulseguard-alpha</code>.
  </p>
  <div style="margin: 24px 0 16px;">
    <a href="https://pulseguard-app-nu.vercel.app/api/ack?tenant=tenant-alpha&customer=Acme%20Corp&by=Account%20Manager" style="display: inline-block; background: #4F46E5; color: #ffffff; font-size: 13.5px; font-weight: 600; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
      Acknowledge risk &rarr;
    </a>
  </div>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 14px;" />
  <p style="font-size: 11.5px; color: #94a3b8; margin: 0;">
    Dispatched by Fastn Workflow <code>pulseguard-risk-engine-v3</code> via Google Gmail connector.
  </p>
</div>`,
  },
  {
    id: 'eml-live-002',
    tenant: 'tenant-beta',
    endOrgId: '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
    to: 'sarah.ops@globex-exports.com',
    from: 'PulseGuard Alerts <alerts@pulseguard.io>',
    subject: '[PulseGuard] Churn risk: Globex Exports — usage down 48%',
    status: 'delivered',
    sentAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    deliveredAt: new Date(Date.now() - 1000 * 60 * 41.5).toISOString(),
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1e293b; border-radius: 8px; border: 1px solid #e2e8f0;">
  <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 20px;">
    <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #ef4444;">PulseGuard Retention Alert</span>
    <h2 style="margin: 6px 0 0; font-size: 20px; color: #0f172a;">Churn risk detected for Globex Exports</h2>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #334155;">
    Telemetry analysis indicates that <strong>Globex Exports</strong> (<code>probe-globex-001</code>) weekly usage dropped by <strong style="color: #dc2626;">48%</strong> this week. Health score: <strong>32/100</strong>.
  </p>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; margin: 18px 0;">
    <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 4px;">SIGNAL TRACE</div>
    <div style="font-size: 13.5px; color: #1e293b;">Automated export jobs paused. 0 API sync calls in last 48h.</div>
  </div>
  <div style="margin: 24px 0 16px;">
    <a href="https://pulseguard-app-nu.vercel.app/api/ack?tenant=tenant-beta&customer=Globex%20Exports&by=Account%20Manager" style="display: inline-block; background: #4F46E5; color: #ffffff; font-size: 13.5px; font-weight: 600; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
      Acknowledge risk &rarr;
    </a>
  </div>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 14px;" />
  <p style="font-size: 11.5px; color: #94a3b8; margin: 0;">
    Dispatched by Fastn Workflow <code>pulseguard-risk-engine-v3</code> via Google Gmail connector.
  </p>
</div>`,
  },
  {
    id: 'eml-live-003',
    tenant: 'tenant-alpha',
    endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
    to: 'j.nabizada@pulseguard.io',
    from: 'PulseGuard Alerts <alerts@pulseguard.io>',
    subject: '[PulseGuard] Weekly Health Summary — Acme Corp (Tier 1)',
    status: 'delivered',
    sentAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    deliveredAt: new Date(Date.now() - 1000 * 60 * 179.5).toISOString(),
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1e293b; border-radius: 8px; border: 1px solid #e2e8f0;">
  <h2 style="margin-top: 0; color: #0f172a;">Weekly Account Health Digest</h2>
  <p style="font-size: 14px; color: #475569;">PulseGuard tracked 3 monitored accounts for Acme Corp this week with $133.7K total ARR under watch.</p>
  <ul style="font-size: 13.5px; line-height: 1.8; color: #334155;">
    <li><strong>Contoso Labs</strong>: 67/100 &mdash; Healthy</li>
    <li><strong>Northwind Traders</strong>: 81/100 &mdash; Healthy</li>
    <li><strong>Acme Corp</strong>: 38/100 &mdash; <span style="color: #ef4444; font-weight: 600;">Needs Attention</span></li>
  </ul>
</div>`,
  },
];

export function getEmails({ tenant, status, search } = {}) {
  const now = Date.now();
  // Auto-upgrade sent -> delivered after 30 seconds
  emailsStore = emailsStore.map((e) => {
    if (e.status === 'sent') {
      const sentTime = new Date(e.sentAt || 0).getTime();
      if (now - sentTime >= 30000) {
        return {
          ...e,
          status: 'delivered',
          deliveredAt: e.deliveredAt || new Date(sentTime + 30000).toISOString(),
        };
      }
    }
    return e;
  });

  let filtered = [...emailsStore];
  if (tenant && tenant !== 'all') {
    filtered = filtered.filter((e) => e.tenant === tenant);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter((e) => e.status.toLowerCase() === status.toLowerCase());
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (e) =>
        (e.to && e.to.toLowerCase().includes(q)) ||
        (e.subject && e.subject.toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => new Date(b.sentAt || 0) - new Date(a.sentAt || 0));
  return filtered;
}

export function recordEmail(entry) {
  const newEmail = {
    id: entry.id || `eml_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    tenant: entry.tenant || 'tenant-alpha',
    endOrgId:
      entry.endOrgId ||
      (entry.tenant === 'tenant-beta'
        ? '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b'
        : '1d599802-f9ad-4d62-830a-e66854c108c3'),
    to: entry.to || 'account-mgr@pulseguard.io',
    from: entry.from || 'PulseGuard Alerts <alerts@pulseguard.io>',
    subject: entry.subject || '[PulseGuard] Churn risk alert',
    html: entry.html || '<p>PulseGuard automated alert.</p>',
    status: entry.status || 'sent',
    sentAt: entry.sentAt || new Date().toISOString(),
    deliveredAt:
      entry.deliveredAt || (entry.status === 'delivered' ? new Date().toISOString() : null),
  };
  emailsStore = [newEmail, ...emailsStore].slice(0, 100);
  return newEmail;
}
