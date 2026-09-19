'use client';
import { useEffect, useRef, useState } from 'react';
import { getTenant, tenantFromSearch } from '../lib/tenants';
import { IconMessage, IconSend, IconX, IconZap, IconCheck, IconSpinner } from './icons';

const GREETING = {
  role: 'assistant',
  content:
    "Hi! I'm your PulseGuard assistant. Ask me what anything on this screen means, which account needs attention first, what just happened — or tell me to acknowledge a risk for you.",
};

function buildContext(tenantId, extraAcked) {
  const t = getTenant(tenantId);
  return {
    tenant: t.id,
    company: t.company,
    channel: t.channel,
    threshold: t.threshold,
    accounts: t.accounts.map((a) => {
      const score = a.trend[a.trend.length - 1];
      const prev = a.trend[a.trend.length - 2];
      const deltaPct = prev ? Math.round(((score - prev) / prev) * 100) : 0;
      const acknowledged = extraAcked[`${t.id}:${a.id}`] || false;
      return { name: a.name, arr: a.arr, score, deltaPct, status: a.status, acknowledged };
    }),
    lastRun: readLastRun(),
  };
}

function readLastRun() {
  try {
    const runs = JSON.parse(localStorage.getItem('pulseguard_runs') || '[]');
    return runs[0] || null;
  } catch {
    return null;
  }
}

export default function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [tenantId, setTenantId] = useState('tenant-alpha');
  const [extraAcked, setExtraAcked] = useState({});
  const [msgs, setMsgs] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const sync = () => setTenantId(tenantFromSearch('tenant-alpha'));
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('tenantchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('tenantchange', sync);
    };
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs, busy, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const tenant = getTenant(tenantId);
  const risky = tenant.accounts.filter(
    (a) => a.status === 'HIGH_RISK' && !extraAcked[`${tenant.id}:${a.id}`]
  );
  const suggestions = [
    'What does HIGH RISK mean?',
    'Which account should I contact first?',
    'What just happened?',
    ...(risky[0] ? [`Acknowledge the ${risky[0].name} risk`] : []),
  ];

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const next = [...msgs, { role: 'user', content }];
    setMsgs(next);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, context: buildContext(tenantId, extraAcked) }),
      });
      const j = await res.json();

      if (j.ok && j.action?.type === 'ack') {
        setMsgs((m) => [...m, { role: 'assistant', content: j.reply, working: true }]);
        try {
          const ackRes = await fetch(
            `/api/ack?tenant=${encodeURIComponent(j.action.tenant)}&customer=${encodeURIComponent(
              j.action.customer
            )}&by=${encodeURIComponent('PulseGuard Assistant')}&format=json`,
            { headers: { Accept: 'application/json' } }
          );
          const ack = await ackRes.json();
          if (ack?.ok) {
            setExtraAcked((m) => ({ ...m, [`${j.action.tenant}:${j.action.customer}`]: true }));
            window.dispatchEvent(
              new CustomEvent('pulseguard:acked', {
                detail: { tenant: j.action.tenant, customer: j.action.customer },
              })
            );
            setMsgs((m) => [
              ...m.map((x) => (x.working ? { ...x, working: false } : x)),
              {
                role: 'assistant',
                content: `✅ Done — ${j.action.customer} is acknowledged. A retention note is on their CRM timeline, the alert is cleared, and the run is recorded on the Activity page. That was a real Fastn workflow execution.`,
              },
            ]);
          } else {
            setMsgs((m) => [
              ...m.map((x) => (x.working ? { ...x, working: false } : x)),
              {
                role: 'assistant',
                content: `The workflow didn't accept that acknowledgement (${
                  ack?.error || ack?.detail || 'unknown error'
                }). You can retry from the Acknowledge button on the account row.`,
              },
            ]);
          }
        } catch (e) {
          setMsgs((m) => [
            ...m.map((x) => (x.working ? { ...x, working: false } : x)),
            { role: 'assistant', content: `I couldn't reach the runtime: ${e.message}` },
          ]);
        }
      } else if (j.ok) {
        setMsgs((m) => [...m, { role: 'assistant', content: j.reply }]);
      } else {
        setMsgs((m) => [...m, { role: 'assistant', content: 'Something went wrong — try again?' }]);
      }
    } catch (e) {
      setMsgs((m) => [...m, { role: 'assistant', content: `Connection issue: ${e.message}` }]);
    }
    setBusy(false);
  }

  return (
    <>
      <button
        className={`assistant-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        title="PulseGuard Assistant"
      >
        {open ? <IconX size={19} /> : <IconMessage size={19} />}
      </button>

      {open && (
        <div className="assistant-panel" role="dialog" aria-label="PulseGuard Assistant">
          <div className="assistant-head">
            <span className="assistant-head-icon">
              <IconZap size={15} />
            </span>
            <div className="assistant-head-text">
              <div className="assistant-title">PulseGuard Assistant</div>
              <div className="assistant-sub">
                {tenant.company} · {tenant.channel}
              </div>
            </div>
            <button className="assistant-close" onClick={() => setOpen(false)} aria-label="Close">
              <IconX size={15} />
            </button>
          </div>

          <div className="assistant-messages" ref={listRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`assistant-msg ${m.role}`}>
                {m.content}
                {m.working && (
                  <span className="assistant-working">
                    <IconSpinner size={13} /> running workflow…
                  </span>
                )}
              </div>
            ))}
            {busy && (
              <div className="assistant-msg assistant typing">
                <span className="tdot" />
                <span className="tdot" />
                <span className="tdot" />
              </div>
            )}
          </div>

          <div className="assistant-chips">
            {suggestions.map((s) => (
              <button key={s} className="assistant-chip" onClick={() => send(s)} disabled={busy}>
                {s}
              </button>
            ))}
          </div>

          <div className="assistant-inputrow">
            <input
              ref={inputRef}
              className="assistant-input"
              placeholder="Ask anything, or give an instruction…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send();
              }}
            />
            <button className="assistant-send" onClick={() => send()} disabled={busy || !input.trim()} aria-label="Send">
              <IconSend size={15} />
            </button>
          </div>
          <div className="assistant-foot">
            <IconCheck size={11} /> Explains what you see · Acts through Fastn workflows
          </div>
        </div>
      )}
    </>
  );
}
