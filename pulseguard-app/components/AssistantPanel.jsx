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
  IconRefresh,
  IconPencil,
  IconSquare,
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
  const [expandedCards, setExpandedCards] = useState({});
  const [sessionTitle, setSessionTitle] = useState('Assistant');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const sendRef = useRef(null);
  const abortRef = useRef(null);

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

  function resetChat() {
    if (abortRef.current) abortRef.current.abort();
    setBusy(false);
    setMsgs([GREETING]);
    setInput('');
    setExpandedCards({});
    setSessionTitle('Assistant');
    setIsEditingTitle(false);
  }

  function toggleCardDetails(idx) {
    setExpandedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  function handleStop() {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setBusy(false);
  }

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;

    const next = [...msgs, { role: 'user', content }];
    setMsgs(next);
    setInput('');
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          context: buildContext(tenantId, extraAcked, page),
        }),
        signal: controller.signal,
      });

      const j = await res.json();

      if (j.ok && j.action?.type === 'ack') {
        const cardId = `tool_${Date.now()}`;
        // Insert Tool-Call Card in running state
        setMsgs((m) => [
          ...m,
          {
            kind: 'tool-card',
            cardId,
            tool: 'acknowledge-risk',
            state: 'running',
            detail: {
              workflow: 'pulseguard-ack-loop (wf_4afb70d49708)',
              customer: j.action.customer,
              tenant: j.action.tenant,
              steps: 'invoking fastn-ack-loop runtime…',
              at: new Date().toISOString(),
            },
          },
          { role: 'assistant', content: j.reply, working: true },
        ]);

        try {
          const ackRes = await fetch(
            `/api/ack?tenant=${encodeURIComponent(j.action.tenant)}&customer=${encodeURIComponent(
              j.action.customer
            )}&by=${encodeURIComponent('PulseGuard Assistant')}&format=json`,
            {
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            }
          );
          const ack = await ackRes.json();

          if (ack?.ok) {
            setExtraAcked((m) => ({ ...m, [`${j.action.tenant}:${j.action.customer}`]: true }));
            window.dispatchEvent(
              new CustomEvent('pulseguard:acked', {
                detail: { tenant: j.action.tenant, customer: j.action.customer },
              })
            );

            // Transition tool card to approved state
            setMsgs((m) =>
              m.map((x) => {
                if (x.cardId === cardId) {
                  return {
                    ...x,
                    state: 'approved',
                    detail: {
                      ...x.detail,
                      steps: 'ack-by-assistant · crm-timeline-updated · alert-cleared · run-recorded',
                      at: new Date().toISOString(),
                    },
                  };
                }
                if (x.working) return { ...x, working: false };
                return x;
              })
            );

            setMsgs((m) => [
              ...m,
              {
                role: 'assistant',
                content: `Done — ${j.action.customer} is acknowledged. A retention note is on their CRM timeline, the alert is cleared, and the run is recorded on the Activity page. That was a real Fastn workflow execution.`,
              },
            ]);
          } else {
            setMsgs((m) =>
              m.map((x) => {
                if (x.cardId === cardId) {
                  return {
                    ...x,
                    state: 'failed',
                    detail: { ...x.detail, steps: `ack-failed: ${ack?.error || 'rejected'}` },
                  };
                }
                if (x.working) return { ...x, working: false };
                return x;
              })
            );
            setMsgs((m) => [
              ...m,
              {
                role: 'assistant',
                content: `The workflow didn't accept that acknowledgement (${
                  ack?.error || ack?.detail || 'unknown error'
                }). You can retry from the Acknowledge button on the account row.`,
              },
            ]);
          }
        } catch (e) {
          if (e.name !== 'AbortError') {
            setMsgs((m) => [
              ...m.map((x) => (x.working ? { ...x, working: false } : x)),
              { role: 'assistant', content: `I couldn't reach the runtime: ${e.message}` },
            ]);
          }
        }
      } else if (j.ok) {
        setMsgs((m) => [...m, { role: 'assistant', content: j.reply }]);
      } else {
        setMsgs((m) => [...m, { role: 'assistant', content: 'Something went wrong — try again?' }]);
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setMsgs((m) => [...m, { role: 'assistant', content: `Connection issue: ${e.message}` }]);
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
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
          {/* Chat Header with Rename + Refresh controls */}
          <div className="chat-head">
            <div className="chat-head-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={sessionTitle}
                    autoFocus
                    onChange={(e) => setSessionTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingTitle(false);
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--line-strong)',
                      borderRadius: 4,
                      color: 'var(--text)',
                      fontSize: 13,
                      padding: '2px 6px',
                      outline: 'none',
                      width: 140,
                    }}
                  />
                ) : (
                  <>
                    <span className="chat-title">{sessionTitle}</span>
                    <button
                      className="chat-icon-btn"
                      title="Rename session"
                      aria-label="Rename conversation"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      <IconPencil size={12} />
                    </button>
                  </>
                )}
              </div>
              <div className="chat-sub">
                {tenant.company} · {tenant.channel}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                className="chat-icon-btn"
                onClick={resetChat}
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <IconRefresh size={13} />
              </button>
              <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">
                <IconX size={15} />
              </button>
            </div>
          </div>

          <div className="chat-msgs" ref={listRef}>
            {msgs.map((m, i) => {
              if (m.kind === 'tool-card') {
                const isExpanded = Boolean(expandedCards[i]);
                const isRunning = m.state === 'running';
                const isApproved = m.state === 'approved';

                return (
                  <div key={i} className="chat-tool-card">
                    <div className="chat-tool-header">
                      <div className="chat-tool-badge-row">
                        <span
                          className={`chat-tool-icon-circle ${isApproved ? 'ok' : isRunning ? 'running' : 'warn'}`}
                        >
                          {isRunning ? (
                            <IconSpinner size={12} />
                          ) : (
                            <IconCheck size={12} />
                          )}
                        </span>
                        <span className="chat-tool-title">
                          {isRunning ? 'Approve tool call:' : 'Approved tool call:'}{' '}
                          <code className="mono">{m.tool}</code>
                        </span>
                      </div>

                      <span className={`badge ${isApproved ? 'ok' : isRunning ? 'ack' : 'risk'}`}>
                        <span className="badge-dot" />
                        {isApproved ? 'Approved' : isRunning ? 'Running' : 'Failed'}
                      </span>
                    </div>

                    {m.detail && (
                      <div className="chat-tool-body">
                        <button
                          type="button"
                          className="chat-tool-toggle"
                          onClick={() => toggleCardDetails(i)}
                        >
                          <span>{isExpanded ? 'Hide details' : 'View details'}</span>
                          <IconChevronDown size={11} className={isExpanded ? 'open' : ''} />
                        </button>

                        {isExpanded && (
                          <div className="chat-tool-trace">
                            <div className="chat-trace-row">
                              <span className="chat-trace-k">Workflow:</span>
                              <span className="chat-trace-v mono">{m.detail.workflow}</span>
                            </div>
                            <div className="chat-trace-row">
                              <span className="chat-trace-k">Target:</span>
                              <span className="chat-trace-v mono">
                                {m.detail.customer} ({m.detail.tenant})
                              </span>
                            </div>
                            <div className="chat-trace-row">
                              <span className="chat-trace-k">Steps:</span>
                              <span className="chat-trace-v mono">{m.detail.steps}</span>
                            </div>
                            {m.detail.at && (
                              <div className="chat-trace-row">
                                <span className="chat-trace-k">Timestamp:</span>
                                <span className="chat-trace-v mono">
                                  {new Date(m.detail.at).toLocaleTimeString()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={i} className={`chat-msg ${m.role}`}>
                  {m.content}
                  {m.working && (
                    <span className="chat-working">
                      <IconSpinner size={12} /> running workflow…
                    </span>
                  )}
                </div>
              );
            })}

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

                {busy ? (
                  <button
                    type="button"
                    className="composer-send stop"
                    onClick={handleStop}
                    aria-label="Stop generating"
                    title="Stop generating"
                  >
                    <IconSquare size={13} strokeWidth={2.5} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="composer-send"
                    onClick={() => send()}
                    disabled={!input.trim()}
                    aria-label="Send"
                  >
                    <IconArrowUp size={14} strokeWidth={2.25} />
                  </button>
                )}
              </div>
            </div>
            <div className="chat-foot">Explains what you see · Acts through Fastn workflows</div>
          </div>
        </div>
      )}
    </>
  );
}
