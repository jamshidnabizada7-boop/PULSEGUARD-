import { NextResponse } from 'next/server';

// POST /api/telemetry — dispatches a customer-health telemetry event into the PulseGuard
// risk engine on Fastn. Tenant context travels via x-end-org-id.
//
// Auth strategy (matches Fastn's documented REST contract):
//   1. If FASTN_TRIGGER_URL_<TENANT> is set (webhook trigger URL minted by Fastn) — POST there.
//   2. Otherwise POST to the workflow execute endpoint with FASTN_API_KEY + x-end-org-id
//      (requires Fastn API keys to be active — see docs/bug-reports.md #1).
// Body: { tenant, customerId, customerDomain, healthScore, usageDropPct, metricSummary }

const WF = 'pulseguard-risk-engine';
const HOST = () => process.env.FASTN_HOST || 'https://live.fastn.ai';
const OWNER_ORG = () => process.env.FASTN_ORG_ID || '';
const TENANT_IDS = {
  'tenant-alpha': '1d599802-f9ad-4d62-830a-e66854c108c3',
  'tenant-beta': '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
};

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 }); }
  const tenant = body.tenant || 'tenant-alpha';
  if (!body.customerId) return NextResponse.json({ ok: false, error: 'customerId required' }, { status: 400 });

  const triggerUrl = process.env[`FASTN_TRIGGER_URL_${tenant.toUpperCase().replace(/-/g, '_')}`];
  const key = process.env.FASTN_API_KEY;

  try {
    if (triggerUrl) {
      const r = await fetch(triggerUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return NextResponse.json({ ok: r.ok, via: 'webhook-trigger', status: r.status });
    }
    if (key) {
      const endOrg = TENANT_IDS[tenant];
      const url = `${HOST()}/api/v1/${endOrg}/workflows/${WF}/execute`;
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'x-org-id': OWNER_ORG(),
          'x-end-org-id': endOrg,
        },
        body: JSON.stringify({ input: body }),
      });
      const text = await r.text();
      return NextResponse.json({ ok: r.ok, via: 'execute-endpoint', status: r.status, detail: text.slice(0, 400) });
    }
    return NextResponse.json({ ok: false, error: 'Fastn not configured: set FASTN_TRIGGER_URL_* or FASTN_API_KEY (see .env.example)' }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 502 });
  }
}
