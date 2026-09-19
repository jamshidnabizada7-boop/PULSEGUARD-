import { NextResponse } from 'next/server';

// PulseGuard Assistant — pure intent service. Deliberately makes NO server-side
// network requests: replies are either built-in (deterministic, grounded in the
// live context the client sends) or, when an LLM_API_KEY/LLM_BASE_URL pair is
// later configured, composed by that provider. Destructive intents (e.g.
// "acknowledge X") are NOT executed here — the route returns an action
// descriptor and the browser panel performs it through the existing
// /api/ack endpoint, so chat clicks run the same governed path as buttons.

const HUMAN_STATUS = {
  RISK_ESCALATED: 'an alert was sent to the team channel',
  ACKNOWLEDGED: 'the risk was acknowledged and the CRM was updated',
  DEDUPLICATED: 'a duplicate alert was blocked by the 30-minute guard',
  HEALTHY: 'the account looked healthy, so no alert was needed',
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const context = body.context || {};
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content?.trim() || '';
  const q = lastUser.toLowerCase();
  const accounts = Array.isArray(context.accounts) ? context.accounts : [];
  const risky = accounts.filter((a) => a.status === 'HIGH_RISK' && !a.acknowledged);

  // ----- Action intents: return a descriptor; the panel executes it client-side -----
  const wantsAck =
    /\b(acknowledge|ack|resolve|handle|close|clear|dismiss)\b/.test(q) &&
    /risk|alert|account|it|this|them/.test(q);

  if (wantsAck) {
    const named =
      accounts.find((a) => q.includes(a.name.toLowerCase())) ||
      accounts.find((a) => q.includes(a.name.toLowerCase().split(' ')[0]));
    const target = named || risky.sort(byArrDesc)[0];

    if (!target) {
      const anyRisk = accounts.some((a) => a.status === 'HIGH_RISK');
      return NextResponse.json({
        ok: true,
        via: 'builtin',
        reply: anyRisk
          ? 'That account is already marked as handled — nothing to acknowledge. Want me to recap what happened instead?'
          : `Good news: none of your accounts are at risk right now, so there is nothing to acknowledge.${
              context.company ? ` Everything in ${context.company} looks healthy.` : ''
            }`,
      });
    }

    if (risky.length === 0 && !named) {
      return NextResponse.json({
        ok: true,
        via: 'builtin',
        reply: `There's no open risk to acknowledge right now. The latest alerts have already been handled — want a recap of recent activity instead?`,
      });
    }

    return NextResponse.json({
      ok: true,
      via: 'builtin',
      action: { type: 'ack', customer: target.name, tenant: context.tenant || 'tenant-alpha' },
      reply: `Acknowledging the risk for ${target.name} now — this runs the real acknowledgement workflow: a retention note goes onto their CRM timeline and the alert is cleared here.`,
    });
  }

  // ----- Built-in responder -----
  const parseArr = (s) => Number(String(s || '').replace(/[^0-9.]/g, '')) || 0;
  function byArrDesc(a, b) {
    return parseArr(b.arr) - parseArr(a.arr);
  }
  const priority = [...risky].sort(byArrDesc)[0] || null;
  const lastRun = context.lastRun || null;
  let reply;

  if (/^(hi|hello|hey|yo)\b/.test(q)) {
    reply = `Hi! I'm the PulseGuard assistant. I can explain anything on this screen, tell you which account needs attention first, recap recent activity, or acknowledge a risk for you — that runs a real Fastn workflow. What would you like to know?`;
  } else if (/what (does|is).*(high risk|risk)|high risk mean|explain.*risk/.test(q)) {
    reply = `HIGH RISK means a customer's weekly usage dropped by more than your alert line (${
      context.threshold ?? 'the'
    }%). PulseGuard has already diagnosed the account, written a note on their CRM timeline, and sent your team a Slack card${
      context.channel ? ` in ${context.channel}` : ''
    }. Nothing more is required from you unless you agree there's a problem — then acknowledge it and the loop closes automatically.`;
  } else if (/(which|who).*(account|customer|contact|call|first|priority)|priorit/.test(q)) {
    if (priority) {
      reply = `Start with ${priority.name} — it's your largest at-risk contract (${priority.arr} ARR, health down to ${priority.score}/100, about ${Math.abs(
        priority.deltaPct || 0
      )}% lower than last week). Their alert card is already in ${
        context.channel || 'your Slack channel'
      }, so the context is there when you open the conversation.`;
    } else if (accounts.length) {
      reply = `No account is at risk right now. If you want a proactive touchpoint, ${accounts[0].name} (${accounts[0].arr}) is your largest contract and trending steady.`;
    } else {
      reply = "I don't have account data on this screen yet — open the Dashboard and ask me again.";
    }
  } else if (/what (has |just )?(happened|run)|last run|recent|recap|activity|latest/.test(q)) {
    if (lastRun) {
      reply = `The most recent run was ${timeAgo(lastRun.at)}: ${
        lastRun.customer || 'an account'
      } went through the ${
        lastRun.wf === 'pulseguard-ack-loop' ? 'acknowledgement loop' : 'risk engine'
      } and ${HUMAN_STATUS[lastRun.status] || String(lastRun.status || '').toLowerCase()}. Every internal step succeeded — the full trace is on the Activity page.`;
    } else {
      reply =
        'Nothing has run yet in this session. Press "Simulate anomaly" to watch PulseGuard detect a drop, update the CRM, and alert your team — then ask me what happened.';
    }
  } else if (/(how|flow|works|pipeline|steps)|what happens|(slack|crm|alert)/.test(q)) {
    reply = `Here's the loop: 1) usage is watched continuously, 2) when weekly usage drops past your ${
      context.threshold ?? ''
    }% alert line, the risk engine diagnoses the account, 3) a note lands on the customer's CRM timeline automatically, 4) your team gets a card in ${
      context.channel || 'Slack'
    } with an Acknowledge button, 5) one click — here or in Slack — updates the CRM again and clears the alert. Everything runs on Fastn, isolated per tenant.`;
  } else if (/threshold|alert line|sensitivity/.test(q)) {
    reply = `The alert line is ${context.threshold ?? 'a'}%: if an account's usage falls by more than that in a week, PulseGuard treats it as churn risk and starts the loop. You can tune it per tenant on the Integrations page.`;
  } else if (/thank|thanks|great|nice|cool/.test(q)) {
    reply = "Any time. I'm here if you want a recap, a prioritisation, or an acknowledgement.";
  } else if (/help|what can you|options|features/.test(q)) {
    reply =
      'I can: explain any status or metric in plain English, tell you which account to contact first and why, recap the latest workflow run, or acknowledge a risk for you — that last one executes a real Fastn workflow, not a mock.';
  } else {
    reply =
      'I can explain anything on this screen, point you to the account that needs attention first, recap recent activity, or acknowledge a risk for you. Try one of the suggestions below — or ask "what happened just now?"';
  }

  return NextResponse.json({ ok: true, via: 'builtin', reply });
}

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} minutes ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  return `${Math.floor(s / 86400)} days ago`;
}
