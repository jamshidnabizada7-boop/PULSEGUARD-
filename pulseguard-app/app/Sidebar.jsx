'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { TENANT_LIST, getTenant, tenantFromSearch, pushTenant } from '../lib/tenants';
import { IconPulse, IconDashboard, IconSparkle, IconActivity, IconUsers, IconChevronDown, IconCheck } from '../components/icons';

const NAV = [
  { href: '/', label: 'Dashboard', icon: IconDashboard, match: '/' },
  { href: '/integrations', label: 'Integrations', icon: IconSparkle, match: '/integrations' },
  { href: '/runs', label: 'Activity', icon: IconActivity, match: '/runs' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [tenant, setTenant] = useState('tenant-alpha');
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef(null);

  useEffect(() => {
    const sync = () => setTenant(tenantFromSearch(pathname === '/runs' ? 'all' : 'tenant-alpha'));
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('tenantchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('tenantchange', sync);
    };
  }, [pathname]);

  // Close the tenant dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!ddOpen) return;
    const onDown = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setDdOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [ddOpen]);

  const current = tenant !== 'all' ? getTenant(tenant) : null;
  const tenantParam = tenant && tenant !== 'all' ? `?tenant=${tenant}` : '';
  const options = [
    ...(pathname === '/runs' ? [{ id: 'all', label: 'All tenants (audit)' }] : []),
    ...TENANT_LIST.map((t) => ({ id: t.id, label: t.label })),
  ];

  function choose(id) {
    setTenant(id);
    pushTenant(id);
    setDdOpen(false);
  }

  return (
    <aside className="sidebar">
      <Link href={`/${tenantParam}`} className="sb-brand">
        <span className="sb-logo">
          <IconPulse size={15} strokeWidth={2.25} />
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
        <div className="sb-dd-wrap" ref={ddRef}>
          <button
            className="sb-dd-btn"
            onClick={() => setDdOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={ddOpen}
          >
            <IconUsers size={13} />
            <span className="sb-dd-label">{current ? current.label : 'All tenants (audit)'}</span>
            <IconChevronDown size={12} className={ddOpen ? 'open' : ''} />
          </button>
          {ddOpen && (
            <div className="sb-dd" role="listbox">
              {options.map((o) => (
                <button
                  key={o.id}
                  role="option"
                  aria-selected={o.id === tenant}
                  className={`sb-dd-item ${o.id === tenant ? 'selected' : ''}`}
                  onClick={() => choose(o.id)}
                >
                  <span>{o.label}</span>
                  {o.id === tenant && <IconCheck size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sb-foot">
        <span className="badge-dot pulse" style={{ color: 'var(--ok)' }} />
        Governed by Fastn
      </div>
    </aside>
  );
}
