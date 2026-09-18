import { NextResponse } from 'next/server';

// POST /api/embed-token — server-side minting of a Fastn embed token for the current tenant.
// This is the production pattern per Fastn docs (Embedding the widget → Token API):
//   POST {FASTN_HOST}/api/v1/embed/token
//   Authorization: Bearer fsk_…   x-org-id: <org>
// The API key NEVER reaches the browser. Tokens live 8h and auto-refresh up to 7 days.
export async function POST(req) {
  const host = process.env.FASTN_HOST || 'https://live.fastn.ai';
  const key = process.env.FASTN_API_KEY;
  const org = process.env.FASTN_ORG_ID || '';
  let body = {};
  try { body = await req.json(); } catch {}
  const tenant = body.tenant || 'tenant-alpha';
  const endOrg = tenant === 'tenant-beta' ? '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b' : '1d599802-f9ad-4d62-830a-e66854c108c3';

  if (!key) {
    return NextResponse.json({ ok: false, error: 'FASTN_API_KEY not configured', hint: 'see .env.example — also see docs/bug-reports.md #1' }, { status: 503 });
  }
  try {
    const r = await fetch(`${host}/api/v1/embed/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'x-org-id': org },
      body: JSON.stringify({ endOrgId: endOrg }),
    });
    const text = await r.text();
    if (!r.ok) return NextResponse.json({ ok: false, error: 'Fastn rejected token mint', status: r.status, detail: text.slice(0, 300) }, { status: 502 });
    const j = JSON.parse(text);
    return NextResponse.json({ ok: true, token: j.token, expiresIn: j.expiresIn, endOrgId: j.endOrgId || endOrg });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 502 });
  }
}
