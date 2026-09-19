import { NextResponse } from 'next/server';
import { getRuns, recordRun } from './store';

export async function GET(req) {
  const url = new URL(req.url);
  const tenant = url.searchParams.get('tenant');
  const runs = getRuns(tenant);
  return NextResponse.json({ ok: true, runs });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const run = recordRun(body);
    return NextResponse.json({ ok: true, run });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
