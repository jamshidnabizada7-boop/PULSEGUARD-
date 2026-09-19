// Single source of truth for tenant/demo data, shared by every page and the assistant.
// The Fastn org, widget and workflow identifiers here are platform facts — the UI keeps
// them out of the default view and surfaces them only under Runs → "Platform details".

export const FASTN_ORG_ID = 'personal_dc05aac8b2c7b361ba84';
export const WIDGET_ID = 'wgt_fa0d339f81d4';

export const WORKFLOWS = {
  riskEngine: { id: 'wf_fe925b124168', name: 'pulseguard-risk-engine-v2' },
  ackLoop: { id: 'wf_4afb70d49708', name: 'pulseguard-ack-loop' },
};

export const TENANTS = {
  'tenant-alpha': {
    id: 'tenant-alpha',
    label: 'Tenant Alpha — Acme Corp',
    name: 'Tenant Alpha',
    company: 'Acme Corp',
    shortCode: 'AC',
    endOrgId: '1d599802-f9ad-4d62-830a-e66854c108c3',
    channel: '#pulseguard-alpha',
    threshold: 40,
    totalArr: '$133.7K',
    avgHealth: 62,
    primaryCustomerId: 'probe-acme-001',
    primaryCustomerName: 'Acme Corp',
    primaryDomain: 'acme-corp.com',
    dropPct: 52,
    dropHealth: 38,
    installationId: 'inst_dcafc09c2f07',
    hubspotCompany: 'Acme Corp (ID: 347506893507)',
    status: 'ACTIVE',
    installationUrl: 'https://app.fastn.dev/installations/inst_dcafc09c2f07',
    widgetUrl: 'https://app.fastn.dev/widgets/wgt_fa0d339f81d4',
    connectorsUrl: 'https://app.fastn.dev/connectors',
    previewUrl: 'https://app.fastn.dev/widgets/preview',
    directUrl:
      'https://api.fastn.dev/api/v1/embed/iframe?org-id=personal_dc05aac8b2c7b361ba84&tenant-id=1d599802-f9ad-4d62-830a-e66854c108c3',
    accounts: [
      { id: 'probe-acme-001', name: 'Acme Corp', shortCode: 'AC', domain: 'acme-corp.com', owner: 'J. Nabizada', arr: '$48,000', trend: [72, 70, 66, 60, 52, 45, 38], status: 'HIGH_RISK' },
      { id: 'acme-002', name: 'Northwind Traders', shortCode: 'NT', domain: 'northwind.com', owner: 'J. Nabizada', arr: '$21,500', trend: [78, 80, 79, 81, 80, 82, 81], status: 'HEALTHY' },
      { id: 'acme-003', name: 'Contoso Labs', shortCode: 'CL', domain: 'contoso.io', owner: 'J. Nabizada', arr: '$64,200', trend: [65, 66, 64, 67, 66, 68, 67], status: 'HEALTHY' },
    ],
  },
  'tenant-beta': {
    id: 'tenant-beta',
    label: 'Tenant Beta — Globex Exports',
    name: 'Tenant Beta',
    company: 'Globex Exports',
    shortCode: 'GE',
    endOrgId: '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
    channel: '#pulseguard-beta',
    threshold: 35,
    totalArr: '$177.5K',
    avgHealth: 64,
    primaryCustomerId: 'probe-globex-001',
    primaryCustomerName: 'Globex Exports',
    primaryDomain: 'globex-exports.com',
    dropPct: 48,
    dropHealth: 32,
    installationId: 'inst_6e346d508e28',
    hubspotCompany: 'Globex Exports (ID: 347476273912)',
    status: 'ACTIVE',
    installationUrl: 'https://app.fastn.dev/installations/inst_6e346d508e28',
    widgetUrl: 'https://app.fastn.dev/widgets/wgt_fa0d339f81d4',
    connectorsUrl: 'https://app.fastn.dev/connectors',
    previewUrl: 'https://app.fastn.dev/widgets/preview',
    directUrl:
      'https://api.fastn.dev/api/v1/embed/iframe?org-id=personal_dc05aac8b2c7b361ba84&tenant-id=8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
    accounts: [
      { id: 'probe-globex-001', name: 'Globex Exports', shortCode: 'GE', domain: 'globex-exports.com', owner: 'J. Nabizada', arr: '$92,000', trend: [85, 82, 78, 70, 60, 48, 32], status: 'HIGH_RISK' },
      { id: 'globex-002', name: 'Initech Logistics', shortCode: 'IL', domain: 'initech-logistics.com', owner: 'J. Nabizada', arr: '$34,000', trend: [80, 81, 79, 83, 82, 84, 85], status: 'HEALTHY' },
      { id: 'globex-003', name: 'Umbrella Software', shortCode: 'US', domain: 'umbrella-soft.io', owner: 'J. Nabizada', arr: '$51,500', trend: [70, 71, 69, 72, 73, 71, 74], status: 'HEALTHY' },
    ],
  },
};

export const TENANT_LIST = [TENANTS['tenant-alpha'], TENANTS['tenant-beta']];

export function getTenant(id) {
  return TENANTS[id] || TENANTS['tenant-alpha'];
}

// Reads the ?tenant= query param (client-side), falling back to `fallback`.
export function tenantFromSearch(fallback = 'tenant-alpha') {
  if (typeof window === 'undefined') return fallback;
  const t = new URLSearchParams(window.location.search).get('tenant');
  if (fallback === 'all') return t && TENANTS[t] ? t : 'all';
  return t && TENANTS[t] ? t : fallback;
}

// Pushes the tenant query param into the URL and notifies listeners.
export function pushTenant(id) {
  if (typeof window === 'undefined') return;
  const u = new URL(window.location.href);
  if (!id || id === 'all') u.searchParams.delete('tenant');
  else u.searchParams.set('tenant', id);
  window.history.pushState({}, '', u.toString());
  window.dispatchEvent(new CustomEvent('tenantchange', { detail: id }));
}
