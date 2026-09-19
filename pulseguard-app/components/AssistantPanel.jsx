'use client';
import { useEffect, useRef, useState } from 'react';
import { getTenant, tenantFromSearch } from '../lib/tenants';
import {
  IconMessage,
  IconX,
  IconZap,
  IconCheck,
  IconSpinner,
  IconArrowUp,
  IconLock,
  IconChevronDown,
  IconInfo,
  IconActivity,
  IconUser,
} from './icons';

const GREETING = {
  role: 'assistant',
  content:
    "Hi! I'm your PulseGuard assistant. Ask me what anything on this screen means, which account needs attention first, what just happened — or tell me to acknowledge a risk for you.",
};

function buildContext(tenantId, extraAcked, page) {
  const t = getTenant(tenantId);
  return {
    page,
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
  const [unseen, setUnseen] = useState(false);
  const [tenantId, setTenantId] = useState('tenant-alpha');
  const [page, setPage] = useState('/');
  const [extraAcked, setExtraAcked] = useState({});
  const [msgs, setMsgs] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const sendRef = useRef(null);

  useEffect(() => {
    const sync = () => {
      setTenantId(tenantFromSearch('tenant-alpha'));
      setPage(window.location.pathname || '/');
    };
    sync();
    try {
      if (!localStorage.getItem('pulseguard_assistant_seen')) setUnseen(true);
    } catch {}
    window.addEventListener('popstate', sync);
    window.addEventListener('tenantchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('tenantchange', sync);
    };
  }, []);

  function openPanel() {
    setOpen(true);
    setUnseen(false);
    try {
      localStorage.setItem('pulseguard_assistant_seen', '1');
    } catch {}
  }

  useEffect(() => {
    const onAsk = (e) => {
      openPanel();
      const q = e.detail?.question;
      if (q) setTimeout(() => sendRef.current?.(q), 60);
    };
    window.addEventListener('pulseguard:ask', onAsk);
    return () => window.removeEventListener('pulseguard:ask', onAsk);
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs, busy, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 140);
  }, [open]);

  // The dock is part of the layout (Cursor-style): shift content aside instead
  // of overlaying it, so nothing on the page is hidden behind the chat.
  useEffect(() => {
    document.body.classList.toggle('chat-open', open);
    return () => document.body.classList.remove('chat-open');
  }, [open]);

  const tenant = getTenant(tenantId);
  const risky = tenant.accounts.filter(
    (a) => a.status === 'HIGH_RISK' && !extraAcked[`${tenant.id}:${a.id}`]
  );
  const suggestions = [
    { icon: IconUser, label: 'Which account needs attention?', desc: 'Prioritise your outreach in seconds' },
    { icon: IconInfo, label: 'What does NEEDS ATTENTION mean?', desc: 'Every status explained in plain English' },
    { icon: IconActivity, label: 'What just happened?', desc: 'A recap of the latest workflow run' },
    ...(risky[0]
      ? [{
          icon: IconCheck,
          label: `Acknowledge the ${risky[0].name} risk`,
          desc: 'Runs the real acknowledgement workflow',
        }]
      : []),
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
        body: JSON.stringify({
          messages: next,
          context: buildContext(tenantId, extraAcked, page),
        }),
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

  sendRef.current = send;

  return (
    <>
      <button
        className={`assistant-fab ${open ? 'open' : ''} ${unseen && !open ? 'attention' : ''}`}
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        title="PulseGuard Assistant — ask anything"
      >
        {open ? <IconX size={18} /> : <IconMessage size={18} />}
      </button>

      {open && (
        <div className="chat-dock" role="dialog" aria-label="PulseGuard Assistant">
          <div className="chat-head">
            <div className="chat-head-text">
              <div className="chat-title">Assistant</div>
              <div className="chat-sub">
                {tenant.company} · {tenant.channel}
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">
              <IconX size={15} />
            </button>
          </div>

          <div className="chat-msgs" ref={listRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.content}
                {m.working && (
                  <span className="chat-working">
                    <IconSpinner size={12} /> running workflow…
                  </span>
                )}
              </div>
            ))}
            {busy && (
              <div className="chat-msg bot typing">
                <span className="tdot" />
                <span className="tdot" />
                <span className="tdot" />
              </div>
            )}
          </div>

          {msgs.length <= 1 && (
            <div className="chat-suggests">
              {suggestions.map(({ icon: Icon, label, desc }) => (
                <button key={label} className="chat-suggest" onClick={() => send(label)} disabled={busy}>
                  <Icon size={15} className="cs-icon" />
                  <span className="cs-label">{label}</span>
                  <span className="cs-desc">{desc}</span>
                  <span className="cs-chev">›</span>
                </button>
              ))}
            </div>
          )}

          <div className="composer-area">
            <div className="composer">
              <textarea
                ref={inputRef}
                className="composer-input"
                rows={2}
                placeholder="Ask anything — or describe an action"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <div className="composer-foot">
                <button className="mode-pill" title="Explains, prioritises, and acknowledges on your behalf">
                  <IconZap size={11} />
                  Agent
                  <IconChevronDown size={11} />
                </button>
                <span className="model-label">
                  <IconLock size={10} />
                  GPT-4o Mini
                </span>
                <span style={{ flex: 1 }} />
                <button
                  className="composer-send"
                  onClick={() => send()}
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                >
                  <IconArrowUp size={14} strokeWidth={2.25} />
                </button>
              </div>
            </div>
            <div className="chat-foot">Explains what you see · Acts through Fastn workflows</div>
          </div>
        </div>
      )}
    </>
  );
}
