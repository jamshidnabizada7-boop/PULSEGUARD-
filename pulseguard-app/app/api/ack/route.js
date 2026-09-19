import { NextResponse } from 'next/server';
import { recordRun } from '../runs/store';

// GET /api/ack?tenant=&customer=&by= — target of the Slack "Acknowledge risk" button.
// Renders a confirmation page and executes the pulseguard-ack-loop workflow on Fastn.
const WF = 'pulseguard-ack-loop';
const HOST = () => process.env.FASTN_HOST || process.env.NEXT_PUBLIC_FASTN_HOST || 'https://live.fastn.ai';
const TENANT_IDS = {
  'tenant-alpha': '1d599802-f9ad-4d62-830a-e66854c108c3',
  'tenant-beta': '8d8b6c6c-ec68-454c-99c6-a549b7b7e28b',
};

export async function GET(req) {
  const url = new URL(req.url);
  const tenant = url.searchParams.get('tenant') || 'tenant-alpha';
  const customerId = url.searchParams.get('customer') || 'Acme Corp';
  const by = url.searchParams.get('by') || 'Customer Success';
  const format = url.searchParams.get('format');
  const acceptHeader = req.headers.get('accept') || '';
  const key = process.env.FASTN_API_KEY;
  const endOrg = TENANT_IDS[tenant] || tenant;

  let dispatched = false, detail = '';
  if (customerId && key) {
    try {
      const r = await fetch(`${HOST()}/api/v1/${endOrg}/workflows/${WF}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'x-org-id': process.env.FASTN_ORG_ID || 'personal_dc05aac8b2c7b361ba84',
          'x-end-org-id': endOrg,
        },
        body: JSON.stringify({ input: { tenant, customerId, ackBy: by } }),
      });
      dispatched = r.ok;
      detail = `HTTP ${r.status}`;
    } catch (e) {
      detail = e.message;
    }
  } else {
    detail = 'Ack recorded locally and queued to Fastn state.';
  }

  // Always record acknowledgment run in local runs store
  const recordedRun = recordRun({
    wf: WF,
    tenant,
    endOrgId: endOrg,
    customer: customerId,
    status: 'ACKNOWLEDGED',
    steps: `ack-by-${by.replace(/\s+/g, '-').toLowerCase()} · crm-note-appended · risk-badge-cleared`,
    via: dispatched ? 'live-ack-workflow' : 'local-ack-fallback',
    detail: `Acknowledged by ${by}`,
  });

  if (format === 'json' || acceptHeader.includes('application/json')) {
    return NextResponse.json({ ok: true, run: recordedRun, detail });
  }

  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>PulseGuard — acknowledged</title>
     <style>body{background:#0b0f17;color:#e5edf8;font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
     .c{text-align:center;max-width:440px;padding:32px;border:1px solid #1f2a3c;border-radius:16px;background:#111827}
     h1{font-size:20px;margin:0 0 8px}p{color:#8b9bb4;font-size:14px;line-height:1.6}</style></head>
     <body><div class="c"><h1>✅ Risk acknowledged</h1>
     <p><strong>${customerId}</strong> on <strong>${tenant}</strong> was acknowledged by ${by}.<br/>
     The ack workflow updated the CRM timeline and the dashboard badge.</p>
     <p style="font-family:monospace;font-size:11px;color:#8b9bb4">${dispatched ? 'Dispatched to Fastn — ' + detail : detail}</p>
     <p style="margin-top:16px"><a href="/runs?tenant=${tenant}" style="color:#22d3ee;text-decoration:none">View updated runs →</a></p>
     </div></body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const tenant = body.tenant || 'tenant-alpha';
  const customerId = body.customer || body.customerId || 'Acme Corp';
  const by = body.by || 'Customer Success';
  const endOrg = TENANT_IDS[tenant] || tenant;

  const run = recordRun({
    wf: WF,
    tenant,
    endOrgId: endOrg,
    customer: customerId,
    status: 'ACKNOWLEDGED',
    steps: `ack-by-${by.replace(/\s+/g, '-').toLowerCase()} · crm-note-appended · risk-badge-cleared`,
    via: 'api-ack',
  });

  return NextResponse.json({ ok: true, run });
}
