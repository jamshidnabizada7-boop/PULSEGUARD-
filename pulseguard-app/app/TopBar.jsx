'use client';
import './globals.css';
import Link from 'next/link';

export const TENANTS = [
  {
    id: 'tenant-alpha',
    label: 'Tenant Alpha — Acme Corp',
    company: 'Acme Corp',
    endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
    channel: '#pulseguard-alpha',
    threshold: 40,
  },
  {
    id: 'tenant-beta',
    label: 'Tenant Beta — Globex Exports',
    company: 'Globex Exports',
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
      <div className="brand">
        <span className="pulse">⚡</span> PulseGrid <small>by PulseGuard</small>
      </div>
      <nav className="nav">
        <Link href={`/${tenantParam}`} className={active === '/' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link href={`/integrations${tenantParam}`} className={active === '/integrations' ? 'active' : ''}>
          Integrations
        </Link>
        <Link href={`/runs${tenantParam}`} className={active === '/runs' ? 'active' : ''}>
          Runs
        </Link>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="badge" style={{ background: 'rgba(34, 211, 238, 0.12)', color: 'var(--accent)', fontSize: 11 }}>
          {current ? `${current.channel} · ${current.threshold}% drop alert` : 'Cross-Tenant Auditing'}
        </span>
        <label className="switch">
          Tenant
          <select value={tenant} onChange={handleSwitch}>
            {active === '/runs' && (
              <option value="all">All Tenants (Aggregated)</option>
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
