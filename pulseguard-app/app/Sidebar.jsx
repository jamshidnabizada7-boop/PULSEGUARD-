'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TENANT_LIST, getTenant, tenantFromSearch, pushTenant } from '../lib/tenants';
import { IconPulse, IconDashboard, IconSparkle, IconActivity, IconUsers } from '../components/icons';

const NAV = [
  { href: '/', label: 'Dashboard', icon: IconDashboard, match: '/' },
  { href: '/integrations', label: 'Integrations', icon: IconSparkle, match: '/integrations' },
  { href: '/runs', label: 'Activity', icon: IconActivity, match: '/runs' },
];

export default function Sidebar() {
  const [pathname, setPathname] = useState('/');
  const [tenant, setTenant] = useState('tenant-alpha');

  useEffect(() => {
    const sync = () => {
      setPathname(window.location.pathname);
      setTenant(tenantFromSearch(window.location.pathname === '/runs' ? 'all' : 'tenant-alpha'));
    };
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('tenantchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('tenantchange', sync);
    };
  }, []);

  const current = tenant !== 'all' ? getTenant(tenant) : null;
  const tenantParam = tenant && tenant !== 'all' ? `?tenant=${tenant}` : '';

  function handleSwitch(e) {
    const next = e.target.value;
    setTenant(next);
    pushTenant(next);
  }

  return (
    <aside className="sidebar">
      <Link href={`/${tenantParam}`} className="sb-brand">
        <span className="sb-logo">
          <IconPulse size={17} strokeWidth={2.25} />
        </span>
        <span className="sb-brand-text">
          <span className="sb-name">PulseGuard</span>
          <span className="sb-tagline">Retention, on autopilot</span>
        </span>
      </Link>

      <nav className="sb-nav">
        {NAV.map(({ href, label, icon: Icon, match }) => (
          <Link
            key={href}
            href={match === '/' ? `/${tenantParam}` : `${href}${tenantParam}`}
            className={`sb-link ${pathname === match ? 'active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="sb-flex" />

      <div className="sb-workspace">
        <div className="sb-label">Workspace</div>
        <div className="sb-tenant-card">
          <span className="company-avatar" style={{ width: 28, height: 28, fontSize: 10.5 }}>
            {current ? current.shortCode : 'ALL'}
          </span>
          <div className="sb-tenant-meta">
            <div className="sb-tenant-name">{current ? current.company : 'All tenants'}</div>
            <div className="sb-tenant-channel mono">
              {current ? current.channel : 'Cross-tenant audit'}
            </div>
          </div>
        </div>
        <label className="sb-switch">
          <IconUsers size={13} />
          <select value={tenant} onChange={handleSwitch} aria-label="Switch workspace">
            {pathname === '/runs' && <option value="all">All tenants (audit)</option>}
            {TENANT_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sb-foot">
        <span className="badge-dot pulse" style={{ color: 'var(--ok)' }} />
        Governed by Fastn
      </div>
    </aside>
  );
}
