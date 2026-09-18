'use client';
import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'PulseGrid Analytics — powered by PulseGuard', description: 'B2B SaaS dashboard with embedded Fastn retention automation' };

const tenants = [
  { id: 'tenant-alpha', label: 'Tenant Alpha — Acme Corp' },
  { id: 'tenant-beta', label: 'Tenant Beta — Globex Exports' },
];

export default function TopBar({ active = '/', tenant = 'tenant-alpha' }) {
  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="pulse">⚡</span> PulseGrid <small>by PulseGuard</small>
        </div>
        <nav className="nav">
          <Link href="/" className={active === '/' ? 'active' : ''}>Dashboard</Link>
          <Link href="/integrations" className={active === '/integrations' ? 'active' : ''}>Integrations</Link>
          <Link href="/runs" className={active === '/runs' ? 'active' : ''}>Runs</Link>
        </nav>
        <label className="switch">
          Tenant
          <select defaultValue={tenant} onChange={(e) => { const u = new URL(window.location); u.searchParams.set('tenant', e.target.value); window.location = u; }}>
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>
      </header>
    </>
  );
}
