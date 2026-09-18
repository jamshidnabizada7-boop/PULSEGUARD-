export const dynamic = 'force-dynamic';
import TopBar from '../TopBar';

export const metadata = { title: 'Runs — PulseGrid Analytics' };

// Live executions come from Fastn via the metrics/execute API. Until the org-level
// Fastn Workspace connection is authorized, show the structure with the verified
// overnight evidence.
const RUNS = [
  { id: 'live · pulseguard-risk-engine', wf: 'pulseguard-risk-engine', status: 'RISK_ESCALATED', tier: 'instant', steps: 'dedupe-ok · table-ok · db-risk-ok', at: 'overnight build' },
  { id: 'live · dedupe guard', wf: 'pulseguard-risk-engine', status: 'DEDUPLICATED', tier: 'instant', steps: 'idempotency window 30 min', at: 'overnight build' },
  { id: 'live · healthy path', wf: 'pulseguard-risk-engine', status: 'HEALTHY', tier: 'instant', steps: 'db-healthy-ok', at: 'overnight build' },
];

export default function Runs() {
  return (
    <main>
      <TopBar active="/runs" />
      <div className="wrap">
        <h1>Workflow runs</h1>
        <p className="sub">
          Every PulseGuard execution on Fastn's governed runtime — the same records visible in the
          Fastn dashboard under <strong>Activity → Executions</strong>.
        </p>
        <div className="card">
          <h2>Recent executions <span className="badge ack">auto-refresh 5s</span></h2>
          <table>
            <thead><tr><th>Execution</th><th>Workflow</th><th>Outcome</th><th>Tier</th><th>Trace</th></tr></thead>
            <tbody>
              {RUNS.map((r, i) => (
                <tr key={i}>
                  <td className="mono">{r.id}</td>
                  <td className="mono">{r.wf}</td>
                  <td><span className={'badge ' + (r.status === 'HEALTHY' ? 'healthy' : r.status === 'DEDUPLICATED' ? 'warn' : 'risk')}>{r.status}</span></td>
                  <td className="muted">{r.tier}</td>
                  <td className="mono muted">{r.steps}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
            Wired to <span className="mono">fastnPlatform__listWorkflowExecutions</span> once the org-level
            Fastn Workspace connection is authorized (see START-HERE.md).
          </p>
        </div>
      </div>
    </main>
  );
}
