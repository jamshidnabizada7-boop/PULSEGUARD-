'use client';
import Link from 'next/link';

export const TENANTS = [
  {
    id: 'tenant-alpha',
    label: 'Tenant Alpha — Acme Corp',
    company: 'Acme Corp',
    shortCode: 'AC',
    endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
    channel: '#pulseguard-alpha',
    threshold: 40,
  },
  {
    id: 'tenant-beta',
    label: 'Tenant Beta — Globex Exports',
    company: 'Globex Exports',
    shortCode: 'GE',
    endOrgId: '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
    channel: '#pulseguard-beta',
    threshold: 35,
  },
];

export default function TopBar({ active = '/', tenant = 'tenant-alpha', onTenantChange }) {
  const current = TENANTS.find((t) => t.id === tenant);
  const isAll = tenant === 'all';

  function handleSwitch(e) {
    const nextTenant = e.target.value;
    if (typeof window !== 'undefined') {
      const u = new URL(window.location.href);
      if (nextTenant === 'all') {
        u.searchParams.delete('tenant');
      } else {
        u.searchParams.set('tenant', nextTenant);
      }
      if (onTenantChange) {
        window.history.pushState({}, '', u.toString());
        window.dispatchEvent(new CustomEvent('tenantchange', { detail: nextTenant }));
        onTenantChange(nextTenant);
      } else {
        window.location.href = u.toString();
      }
    }
  }

  const tenantParam = tenant && tenant !== 'all' ? `?tenant=${tenant}` : '';

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Link href={`/${tenantParam}`} className="brand">
          <div className="brand-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">PulseGuard</span>
            <span className="brand-subtitle">Autonomous Retention Engine</span>
          </div>
        </Link>

        <nav className="nav">
          <Link href={`/${tenantParam}`} className={active === '/' ? 'active' : ''}>
            <svg className="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            Dashboard
          </Link>
          <Link href={`/integrations${tenantParam}`} className={active === '/integrations' ? 'active' : ''}>
            <svg className="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" />
            </svg>
            Integrations
          </Link>
          <Link href={`/runs${tenantParam}`} className={active === '/runs' ? 'active' : ''}>
            <svg className="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Runs &amp; Activity
          </Link>
        </nav>
      </div>

      <div className="switch-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--ok)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: 11.5,
            padding: '3px 10px'
          }}>
            <span className="badge-dot pulse" />
            Fastn Governed
          </span>

          <span className="badge" style={{
            background: 'rgba(6, 182, 212, 0.1)',
            color: 'var(--accent)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            fontSize: 11.5,
            padding: '3px 10px'
          }}>
            {current ? `${current.channel} · ${current.threshold}% drop alert` : 'Cross-Tenant Audit'}
          </span>
        </div>

        <label className="switch">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Tenant:</span>
          <select value={tenant} onChange={handleSwitch}>
            {active === '/runs' && (
              <option value="all">All Tenants (Aggregated Audit)</option>
            )}
            {TENANTS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
