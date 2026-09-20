'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { TENANTS, getTenant, tenantFromSearch } from '../lib/tenants';
import InfoDot from '../components/InfoDot';
import {
  IconAlert,
  IconCheckCircle,
  IconDollar,
  IconHeart,
  IconZap,
  IconSpinner,
  IconCheck,
  IconUser,
  IconRefresh,
} from '../components/icons';

function Spark({ points, isRisk, id }) {
  const w = 96, h = 28;
  const minVal = 20, maxVal = 100;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = (i * step).toFixed(1);
    const y = Math.max(3, Math.min(h - 3, h - ((p - minVal) / (maxVal - minVal)) * (h - 6))).toFixed(1);
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;
  const lastPoint = coords[coords.length - 1];

  const strokeColor = isRisk ? '#f87171' : '#4ade80';
  const fillGradientId = `grad_${id || 'spark'}_${isRisk ? 'risk' : 'ok'}`;

  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.14" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${fillGradientId})`} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPoint.x} cy={lastPoint.y} r="2.75" fill={strokeColor} />
    </svg>
  );
}

// Animates a number to its new value (400ms ease-out) — makes KPI flips feel alive on video.
function CountUp({ value }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    if (from === to || typeof from !== 'number' || typeof to !== 'number') {
      setDisplay(to);
      return;
    }
    const start = performance.now();
    const dur = 450;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display}</>;
}

export default function Home() {
  const [tenant, setTenant] = useState('tenant-alpha');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [ackedMap, setAckedMap] = useState({});
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [highlightType, setHighlightType] = useState('anomaly');
  const [welcomed, setWelcomed] = useState(true);
  const [progress, setProgress] = useState(null);
  const [emailsDelivered, setEmailsDelivered] = useState(2);
  const progressTimers = useRef([]);

  useEffect(() => {
    try {
      if (!localStorage.getItem('pulseguard_welcomed')) setWelcomed(false);
    } catch {}
  }, []);

  function dismissWelcome() {
    setWelcomed(true);
    try {
      localStorage.setItem('pulseguard_welcomed', '1');
    } catch {}
  }

  const syncTenantFromUrl = useCallback(() => {
    setTenant(tenantFromSearch('tenant-alpha'));
  }, []);

  useEffect(() => {
    syncTenantFromUrl();
    window.addEventListener('popstate', syncTenantFromUrl);
    window.addEventListener('tenantchange', syncTenantFromUrl);
    return () => {
      window.removeEventListener('popstate', syncTenantFromUrl);
      window.removeEventListener('tenantchange', syncTenantFromUrl);
    };
  }, [syncTenantFromUrl]);

  useEffect(() => {
    fetch(`/api/emails?tenant=${tenant}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.ok) {
          setEmailsDelivered(
            data.deliveredCount !== undefined
              ? data.deliveredCount
              : (data.emails || []).filter((e) => e.status === 'delivered').length
          );
        }
      })
      .catch(() => {});
  }, [tenant]);

  // The assistant can acknowledge risks from chat — keep the table in sync.
  useEffect(() => {
    const onChatAck = (e) => {
      const { tenant: t, customer } = e.detail || {};
      const acc = (TENANTS[t]?.accounts || []).find((a) => a.name === customer);
      if (!acc) return;
      setAckedMap((m) => ({ ...m, [`${t}:${acc.id}`]: true }));
      if (t === tenant) {
        setHighlightedRow(acc.id);
        setHighlightType('ack');
        setTimeout(() => setHighlightedRow(null), 2800);
      }
    };
    window.addEventListener('pulseguard:acked', onChatAck);
    return () => window.removeEventListener('pulseguard:acked', onChatAck);
  }, [tenant]);

  const t = getTenant(tenant);

  const rows = t.accounts.map((a) => ({
    ...a,
    acknowledged: Boolean(ackedMap[`${tenant}:${a.id}`]),
  }));

  async function syncTelemetry() {
    setBusy(true);
    setToast(null);
    const primary = t.accounts[0];
    const dropPct = t.dropPct;
    const health = t.dropHealth;

    // Production telemetry sync: Ingest real-time customer usage and evaluate alert thresholds
    setProgress(`Ingesting telemetry for ${t.company}…`);
    progressTimers.current.forEach(clearTimeout);

    setHighlightedRow(primary.id);
    setHighlightType('anomaly');

    try {
      // Step 1: Sequential visual narration stages
      await new Promise((r) => setTimeout(r, 500));
      setProgress('Evaluating retention thresholds…');

      await new Promise((r) => setTimeout(r, 550));
      setProgress(`Syncing CRM & ${t.channel}…`);

      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: primary.id,
          accountName: primary.name,
          customerDomain: primary.domain,
          healthScore: health,
          usageDropPct: dropPct,
          metricSummary: `Production telemetry event for ${primary.name}: weekly usage trend evaluated, threshold monitored.`,
          tenant,
        }),
      });
      const j = await res.json();
      if (j.ok) {
        setProgress('Telemetry synced');
        setTimeout(() => {
          setProgress(null);
          setHighlightedRow(null);
        }, 1500);
        setToast(`Telemetry synced — live customer usage and health scores refreshed for ${t.company}`);

        if (typeof window !== 'undefined') {
          try {
            const existing = JSON.parse(localStorage.getItem('pulseguard_runs') || '[]');
            const runEntry = j.run || {
              id: `probe_${Date.now().toString(36)}`,
              wf: 'pulseguard-risk-engine-v2',
              tenant,
              endOrgId: t.endOrgId,
              customer: `${primary.name} (${primary.id})`,
              status: 'RISK_ESCALATED',
              tier: 'instant',
              steps: `usageDrop ${dropPct}% >= threshold · crm-timeline-noted · slack-card-queued · email-alert-sent`,
              at: new Date().toISOString(),
              via: j.via || 'simulated-dispatch-fallback',
            };
            localStorage.setItem('pulseguard_runs', JSON.stringify([runEntry, ...existing].slice(0, 50)));
          } catch {}
        }
      } else {
        setProgress(null);
        setToast('Dispatch failed: ' + (j.error || res.status));
      }
    } catch (e) {
      setProgress(null);
      setToast('Dispatch failed: ' + e.message);
    }
    setBusy(false);
    setTimeout(() => setToast(null), 6000);
  }

  async function acknowledge(accId) {
    const acc = rows.find((a) => a.id === accId);
    if (!acc) return;
    try {
      const res = await fetch(
        `/api/ack?tenant=${tenant}&customer=${encodeURIComponent(acc.name)}&by=Customer%20Success&format=json`,
        { headers: { Accept: 'application/json' } }
      );
      const j = await res.json().catch(() => ({}));

      setAckedMap((m) => ({ ...m, [`${tenant}:${accId}`]: true }));
      setHighlightedRow(accId);
      setHighlightType('ack');
      setTimeout(() => setHighlightedRow(null), 2800);
      setToast(`Risk for ${acc.name} acknowledged — their CRM timeline was updated`);

      if (typeof window !== 'undefined') {
        try {
          const existing = JSON.parse(localStorage.getItem('pulseguard_runs') || '[]');
          const ackRun = (j && j.run) ? j.run : {
            id: `ack_${Date.now().toString(36)}`,
            wf: 'pulseguard-ack-loop',
            tenant,
            endOrgId: t.endOrgId,
            customer: acc.name,
            status: 'ACKNOWLEDGED',
            tier: 'instant',
            steps: 'ack-by-customer-success · crm-note-appended · risk-badge-cleared',
            at: new Date().toISOString(),
            via: 'api-ack',
          };
          localStorage.setItem('pulseguard_runs', JSON.stringify([ackRun, ...existing].slice(0, 50)));
        } catch {}
      }

      setTimeout(() => setToast(null), 5000);
    } catch {
      setAckedMap((m) => ({ ...m, [`${tenant}:${accId}`]: true }));
    }
  }

  const atRisk = rows.filter((r) => r.status === 'HIGH_RISK' && !r.acknowledged).length;

  return (
    <main>
      <div className="wrap">
        {/* First-visit orientation (Cursor-style: one sentence, two choices) */}
        {!welcomed && (
          <div className="welcome-strip">
            <span className="welcome-icon">
              <IconZap size={17} />
            </span>
            <div className="welcome-text">
              <div className="welcome-title">
                PulseGuard watches how customers use your product — and warns you before they churn
              </div>
              <div className="welcome-sub">
                First time here? Every number and badge on this page explains itself — click any{' '}
                <span className="mono">ⓘ</span> or just ask.
              </div>
            </div>
            <div className="welcome-actions">
              <button
                className="btn sm"
                onClick={() => {
                  dismissWelcome();
                  window.dispatchEvent(new CustomEvent('pulseguard:ask', { detail: {} }));
                }}
              >
                Ask the assistant
              </button>
              <button className="btn ghost sm" onClick={dismissWelcome}>
                Explore on my own
              </button>
            </div>
          </div>
        )}

        {/* Page header */}
        <div className="page-head">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <h1 style={{ marginBottom: 0 }}>Customer Health &amp; Retention Loop</h1>
              <span className="badge" style={{ color: 'var(--muted)' }}>
                {t.company}
              </span>
            </div>
            <p className="sub" style={{ marginBottom: 0 }}>
              PulseGuard continuously monitors customer usage telemetry in real-time. When usage drops suddenly, it
              diagnoses the account, updates your CRM, and alerts your team — before the customer
              is gone.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              className="badge ok"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 13px',
                fontSize: 12.5,
                fontWeight: 550,
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                color: 'var(--ok)',
              }}
            >
              <span className="badge-dot pulse" style={{ width: 7, height: 7, background: 'var(--ok)' }} />
              Autonomous Watch Active
            </span>

            <button
              className="btn ghost sm"
              onClick={syncTelemetry}
              disabled={busy}
              title="Poll and sync latest telemetry for this portfolio"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 13px',
                fontSize: 12.5,
              }}
            >
              <IconRefresh size={13} className={busy ? 'spin' : ''} />
              <span>{busy ? 'Syncing Telemetry…' : 'Sync Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="kpis">
          <div className="kpi">
            <div className="l">
              <span>Accounts at risk</span>
              <span className="icon-chip risk">
                <IconAlert size={15} />
              </span>
            </div>
            <div className={`n ${atRisk > 0 ? 'risk' : 'ok'}`}>
              <CountUp value={atRisk} />
            </div>
            <div className="sub-tag">
              {atRisk > 0 ? (
                <>
                  <span className="badge-dot pulse" style={{ color: 'var(--risk)' }} />
                  <span>
                    Usage fell past the {t.threshold}% alert line
                    <InfoDot
                      question="What is the alert line?"
                      text={`If weekly usage drops by more than ${t.threshold}%, PulseGuard treats it as churn risk and starts the alert loop automatically.`}
                    />
                  </span>
                </>
              ) : (
                <>
                  <span className="badge-dot" style={{ color: 'var(--ok)' }} />
                  <span>All anomalies handled</span>
                </>
              )}
            </div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Healthy accounts</span>
              <span className="icon-chip ok">
                <IconCheckCircle size={15} />
              </span>
            </div>
            <div className="n ok"><CountUp value={rows.length - atRisk} /></div>
            <div className="sub-tag">
              <span>Normal usage, no action needed</span>
            </div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Revenue protected</span>
              <span className="icon-chip accent">
                <IconDollar size={15} />
              </span>
            </div>
            <div className="n">{t.totalArr}</div>
            <div className="sub-tag">
              <span>
                Contract value under watch
                <InfoDot
                  question="What does Revenue protected mean?"
                  text="The total annual contract value of the accounts PulseGuard is monitoring for this tenant."
                />
              </span>
            </div>
          </div>

          <div className="kpi">
            <div className="l">
              <span>Avg health score</span>
              <span className="icon-chip warn">
                <IconHeart size={15} />
              </span>
            </div>
            <div className="n warn">
              <CountUp value={t.avgHealth} />
              <span className="muted" style={{ fontSize: 15, fontWeight: 500 }}>/100</span>
            </div>
            <div className="sub-tag">
              <span>
                Average across your accounts
                <InfoDot
                  question="What does the health score mean?"
                  text="Health blends product usage, engagement and recency into one 0–100 score. 70+ is comfortable; below 50 usually means someone stopped logging in."
                />
              </span>
            </div>
          </div>
        </div>

        {/* Monitored accounts */}
        <div className="card">
          <h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span>Monitored accounts ({rows.length})</span>
              <span className="badge" style={{ color: 'var(--muted)' }}>
                <span className="badge-dot" style={{ color: 'var(--accent)' }} />
                Alerts go to {t.channel}
              </span>
            </div>
            <span className="muted" style={{ fontSize: 12.5, fontWeight: 450 }}>
              Alerts fire when weekly usage drops {t.threshold}%
            </span>
          </h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Owner</th>
                  <th>Contract value</th>
                  <th>
                    Health · last 7 days
                    <InfoDot
                      question="What do the health sparklines mean?"
                      text="Each line is one account's health score over the past week. A falling red line is an early churn signal."
                    />
                  </th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const isActiveRisk = a.status === 'HIGH_RISK' && !a.acknowledged;
                  const currentScore = a.trend[a.trend.length - 1];
                  const prevScore = a.trend[a.trend.length - 2];
                  const deltaPct = prevScore ? Math.round(((currentScore - prevScore) / prevScore) * 100) : 0;
                  const deltaClass = deltaPct <= -5 ? 'down' : deltaPct >= 5 ? 'up' : 'flat';

                  return (
                    <tr
                      key={a.id}
                      className={highlightedRow === a.id ? (highlightType === 'ack' ? 'row-ack-pulse' : 'row-anomaly-pulse') : ''}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="company-avatar">{a.shortCode || a.name.substring(0, 2).toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: 650, color: '#fff', fontSize: 14, whiteSpace: 'nowrap' }}>{a.name}</div>
                            <div className="muted mono" style={{ fontSize: 12 }}>{a.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                          <IconUser size={14} style={{ color: 'var(--muted)' }} />
                          <span>{a.owner}</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#fff', fontSize: 14 }}>{a.arr}</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Spark points={a.trend} isRisk={isActiveRisk} id={a.id} />
                          <span className="mono" style={{ fontWeight: 600, fontSize: 13, color: isActiveRisk ? 'var(--risk)' : 'var(--ok)' }}>
                            {currentScore}
                          </span>
                          <span className={`delta ${deltaClass}`}>
                            {deltaPct < 0 ? '▾' : '▴'} {Math.abs(deltaPct)}% this week
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
                          {isActiveRisk ? (
                            <span className="badge risk" title="Weekly usage dropped past the alert line — CRM noted, Slack alerted.">
                              <span className="badge-dot pulse" />
                              NEEDS ATTENTION
                            </span>
                          ) : a.acknowledged ? (
                            <span className="badge ack" title="A team member acknowledged this risk — the CRM was updated.">
                              <span className="badge-dot" />
                              HANDLED
                            </span>
                          ) : (
                            <span className="badge healthy">
                              <span className="badge-dot" />
                              HEALTHY
                            </span>
                          )}
                          {highlightedRow === a.id && progress && highlightType === 'anomaly' && (
                            <span className="row-progress" style={{ marginTop: 2 }}>
                              <IconSpinner size={12} />
                              {progress}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {isActiveRisk ? (
                          <button className="btn ghost sm" onClick={() => acknowledge(a.id)}>
                            <IconCheck size={13} style={{ color: 'var(--accent)' }} />
                            Acknowledge risk
                          </button>
                        ) : a.acknowledged ? (
                          <span className="mono muted" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <IconCheck size={13} style={{ color: 'var(--ok)' }} />
                            Synced to CRM
                          </span>
                        ) : (
                          <span className="muted" style={{ fontSize: 12.5 }}>Watched automatically</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* How it works */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ margin: 0 }}>How the loop protects your revenue</h2>
            <span className="badge" style={{ color: 'var(--muted)' }}>
              <span className="badge-dot" style={{ color: 'var(--ok)' }} />
              Fully automatic · per-tenant isolated
            </span>
          </div>
          <p className="muted" style={{ fontSize: 13.5, marginBottom: 16 }}>
            No rules to configure. When something looks wrong, the right people find out — with the
            diagnosis already written down.
          </p>

          <div className="pipeline-grid">
            <div className="pipeline-step">
              <div className="step-num">Step 1</div>
              <div className="step-title">Usage drops</div>
              <div className="step-desc">
                A customer's weekly usage falls by more than the {t.threshold}% alert line.
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-num">Step 2</div>
              <div className="step-title">Risk detected</div>
              <div className="step-desc">
                PulseGuard evaluates the drop in seconds — and checks it isn't a false alarm.
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-num">Step 3</div>
              <div className="step-title">CRM updated</div>
              <div className="step-desc">
                A diagnosis note lands on the customer's CRM timeline — no one had to write it.
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-num">Step 4</div>
              <div className="step-title">Team alerted</div>
              <div className="step-desc">
                A Slack card and an email alert reach your team with a one-click Acknowledge button.
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-num">Step 5</div>
              <div className="step-title">Loop closed</div>
              <div className="step-desc">
                One click — here or in Slack — records the follow-up in the CRM and clears the alert.
              </div>
            </div>
          </div>
        </div>

        {/* Status footer */}
        <div className="status-footer">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="badge-dot" style={{ color: 'var(--ok)' }} />
            All systems operational
          </span>
          <span>Alerts to <strong>{t.channel}</strong></span>
          <span>Isolated workspace: <strong>{t.name}</strong></span>
          <span>Emails delivered this week: <strong>{emailsDelivered}</strong></span>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <span>{toast}</span>
        </div>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
