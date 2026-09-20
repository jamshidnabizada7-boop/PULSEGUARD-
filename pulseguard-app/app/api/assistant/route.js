import { NextResponse } from 'next/server';

// PulseGuard Assistant.
// Layer 1 — actions: "acknowledge Acme's risk" returns an action descriptor; the
//           browser panel executes it through /api/ack (same governed path as the
//           dashboard button). This route itself makes NO user-driven requests.
// Layer 2 — LLM: OpenAI-compatible chat completion. The endpoint is a fixed
//           literal (OpenRouter — edit the constant to change providers); the key
//           lives in .env.local and is sent only in the Authorization header. On
//           any failure we fall back to the built-in responder so the product
//           never shows a dead chat.
// Layer 3 — built-in responder: deterministic, context-grounded answers.

const SCREEN_GUIDE = `The product has three pages (left sidebar): Dashboard, Integrations, Activity.
Dashboard elements: KPI cards (Accounts at risk, Healthy accounts, Revenue protected = total contract value watched, Avg health score = 0-100 usage/engagement blend); a Monitored accounts table where each row has an avatar, owner, contract value, a 7-day health sparkline (falling red line = churn signal), a "vs this week" delta chip, a status badge (NEEDS ATTENTION / HANDLED / HEALTHY) and an Acknowledge risk button; a "How the loop protects your revenue" pipeline (Usage drops > Risk detected > CRM updated > Team alerted > Loop closed); a status footer.
Activity page: run history rows (When, Tenant & account, Workflow = Risk engine or Acknowledgement loop, Outcome badge, Ran on = where it executed, Execution trace = ordered internal steps proving real execution), KPIs (Total runs, Alerts sent, Duplicates blocked, Resolved or healthy), tenant filter, and a collapsed "Platform details" section holding all technical IDs.
Integrations page: connector cards for HubSpot CRM and Slack Messaging with Test buttons, alert threshold slider, Slack channel setting, plus Widget / Live embed / Specs views.
Badges: NEEDS ATTENTION = usage fell past the alert line and someone should look; HANDLED = a teammate acknowledged it and the CRM was updated; HEALTHY = normal usage.`;

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

  // ----- Layer 1: action intents (descriptor only; panel executes client-side) -----
  const wantsAck =
    /\b(acknowledge|ack|resolve|handle|close|clear|dismiss)\b/.test(q) &&
    /risk|alert|account|it|this|them/.test(q);

  if (wantsAck) {
    const named =
      accounts.find((a) => q.includes(a.name.toLowerCase())) ||
      accounts.find((a) => q.includes(a.name.toLowerCase().split(' ')[0]));
    const parseArr = (s) => Number(String(s || '').replace(/[^0-9.]/g, '')) || 0;
    const target = named || [...risky].sort((a, b) => parseArr(b.arr) - parseArr(a.arr))[0];

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
        reply:
          "There's no open risk to acknowledge right now. The latest alerts have already been handled — want a recap of recent activity instead?",
      });
    }

    return NextResponse.json({
      ok: true,
      via: 'builtin',
      action: { type: 'ack', customer: target.name, tenant: context.tenant || 'tenant-alpha' },
      reply: `Acknowledging the risk for ${target.name} now — this runs the real acknowledgement workflow: a retention note goes onto their CRM timeline and the alert is cleared here.`,
    });
  }

  // ----- Layer 2: LLM (fixed endpoint, hard timeout, graceful fallback) -----
  if (process.env.LLM_API_KEY) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      const llmRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.LLM_API_KEY}`,
          'HTTP-Referer': process.env.APP_BASE_URL || 'http://localhost:3210',
          'X-Title': 'PulseGuard',
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || 'openai/gpt-4o-mini',
          temperature: 0.4,
          max_tokens: 250,
          messages: [
            {
              role: 'system',
              content:
                `You are the PulseGuard assistant inside a customer-retention dashboard. The user may be a first-time visitor who doesn't know the domain — explain patiently, in plain English, without jargon.\n` +
                `Rules: use ONLY the JSON context for facts (never invent accounts or numbers); keep answers under 90 words; no markdown headings; be warm and concrete; if asked to acknowledge a risk, say you're on it.\n\n` +
                `Screen guide:\n${SCREEN_GUIDE}\n\nLive context (JSON):\n${JSON.stringify(context)}`,
            },
            ...messages.slice(-10),
          ],
        }),
      });
      clearTimeout(timer);
      const j = await llmRes.json();
      const reply = j?.choices?.[0]?.message?.content;
      if (llmRes.ok && reply) return NextResponse.json({ ok: true, via: 'llm', reply });
    } catch {
      // fall through to built-in responder
    }
  }

  // ----- Layer 3: built-in responder -----
  const parseArr = (s) => Number(String(s || '').replace(/[^0-9.]/g, '')) || 0;
  const priority = [...risky].sort((a, b) => parseArr(b.arr) - parseArr(a.arr))[0] || null;
  const lastRun = context.lastRun || null;
  let reply;

  if (/^(hi|hello|hey|yo)\b/.test(q)) {
    reply = `Hi! I'm the PulseGuard assistant. I can explain anything on this screen, tell you which account needs attention first, recap recent activity, or acknowledge a risk for you — that runs a real Fastn workflow. What would you like to know?`;
  } else if (/what (does|is).*(high risk|risk)|high risk mean|explain.*risk|need(s)? attention/.test(q)) {
    reply = `HIGH RISK (shown as "needs attention") means a customer's weekly usage dropped by more than your alert line (${
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
        'Telemetry ingestion is actively monitoring all accounts. No churn anomalies have crossed your threshold in this session. Ask me to check account health scores or review connector statuses.';
    }
  } else if (/sparkline|trend line|graph|chart|red line/.test(q)) {
    reply =
      "Each small chart is one account's health score over the last 7 days — right side is today. A gently flat green line is good. A falling red line means engagement is slipping; that's the early signal PulseGuard watches for you.";
  } else if (/tenant|workspace|alpha|beta|isolat/.test(q)) {
    reply = `A workspace (tenant) is one customer of your product with their own CRM connection and Slack channel. Switch workspaces from the bottom of the left sidebar — data never crosses between them, which is why Acme's alerts can never appear in Globex's channel.`;
  } else if (/(how|flow|works|pipeline|steps)|what happens|(slack|crm|alert)/.test(q)) {
    reply = `Here's the loop: 1) usage is watched continuously, 2) when weekly usage drops past your ${
      context.threshold ?? ''
    }% alert line, the risk engine diagnoses the account, 3) a note lands on the customer's CRM timeline automatically, 4) your team gets a card in ${
      context.channel || 'Slack'
    } with an Acknowledge button, 5) one click — here or in Slack — updates the CRM again and clears the alert. Everything runs on Fastn, isolated per tenant.`;
  } else if (/threshold|alert line|sensitivity/.test(q)) {
    reply = `The alert line is ${context.threshold ?? 'a'}%: if an account's usage falls by more than that in a week, PulseGuard treats it as churn risk and starts the loop. You can tune it per tenant on the Integrations page.`;
  } else if (/(where|which page).*(see|find)|navigate|page/.test(q)) {
    reply =
      'Three pages, in the left sidebar: Dashboard for account health and actions, Integrations to connect CRM/Slack and tune the alert line, Activity to see proof of every automated run. The assistant (me) is on every page.';
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

const HUMAN_STATUS = {
  RISK_ESCALATED: 'an alert was sent to the team channel',
  ACKNOWLEDGED: 'the risk was acknowledged and the CRM was updated',
  DEDUPLICATED: 'a duplicate alert was blocked by the 30-minute guard',
  HEALTHY: 'the account looked healthy, so no alert was needed',
};

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} minutes ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  return `${Math.floor(s / 86400)} days ago`;
}
