import { NextResponse } from 'next/server';

// POST /api/embed-token & GET /api/embed-token?tenant=...
// Server-side minting of a Fastn embed token for the current tenant.
// Production pattern per Fastn docs:
//   POST {FASTN_HOST}/api/v1/embed/token
//   Authorization: Bearer fsk_…   x-org-id: <org>
// The API key NEVER reaches the browser. Tokens live 8h and auto-refresh.
// If server token minting fails, provides fallback direct URL for widget wgt_fa0d339f81d4.

const TENANT_IDS = {
  'tenant-alpha': '1d599802-f9ad-4d62-830a-e66854c108c3',
  'tenant-beta': '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
};

async function handleEmbedToken(tenantParam) {
  const host = process.env.FASTN_HOST || process.env.NEXT_PUBLIC_FASTN_HOST || 'https://live.fastn.ai';
  const key = process.env.FASTN_API_KEY;
  const org = process.env.FASTN_ORG_ID || 'personal_dc05aac8b2c7b361ba84';
  const tenant = tenantParam || 'tenant-alpha';
  const endOrg = TENANT_IDS[tenant] || tenant;
  const widgetId = 'wgt_fa0d339f81d4';
  const directUrl = `${host}/api/v1/embed/iframe?widgetId=${widgetId}&endOrgId=${endOrg}`;

  if (!key) {
    return NextResponse.json({
      ok: false,
      error: 'FASTN_API_KEY not configured',
      hint: 'Using direct iframe fallback for widget wgt_fa0d339f81d4',
      widgetId,
      endOrgId: endOrg,
      tenant,
      directUrl,
    }, { status: 200 });
  }

  try {
    const r = await fetch(`${host}/api/v1/embed/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'x-org-id': org,
      },
      body: JSON.stringify({ endOrgId: endOrg }),
    });
    const text = await r.text();
    if (r.ok) {
      try {
        const j = JSON.parse(text);
        if (j.token) {
          return NextResponse.json({
            ok: true,
            token: j.token,
            expiresIn: j.expiresIn,
            endOrgId: j.endOrgId || endOrg,
            tenant,
            widgetId,
            directUrl,
          });
        }
      } catch {}
    }

    // Fastn token mint was rejected (e.g. bug #1); return clean fallback payload with HTTP 200
    return NextResponse.json({
      ok: false,
      error: 'Fastn token minting rejected: ' + (text.slice(0, 150) || r.status),
      hint: 'Direct iframe fallback active',
      widgetId,
      endOrgId: endOrg,
      tenant,
      directUrl,
    }, { status: 200 });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e.message,
      hint: 'Direct iframe fallback active',
      widgetId,
      endOrgId: endOrg,
      tenant,
      directUrl,
    }, { status: 200 });
  }
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return handleEmbedToken(body.tenant);
}

export async function GET(req) {
  const url = new URL(req.url);
  const tenant = url.searchParams.get('tenant');
  return handleEmbedToken(tenant);
}
