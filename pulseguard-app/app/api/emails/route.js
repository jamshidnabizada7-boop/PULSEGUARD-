import { NextResponse } from 'next/server';
import { getEmails, recordEmail } from './store';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const tenant = url.searchParams.get('tenant') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const search = url.searchParams.get('search') || url.searchParams.get('q') || undefined;

    const emails = getEmails({ tenant, status, search });
    return NextResponse.json({
      ok: true,
      emails,
      total: emails.length,
      deliveredCount: emails.filter((e) => e.status === 'delivered').length,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const email = recordEmail(body);
    return NextResponse.json({ ok: true, email }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
