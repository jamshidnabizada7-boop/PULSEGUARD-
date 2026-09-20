# Demo Video Script — 2:00 (Hard Cap for Submission)

**Rules from the organizers:** Short and point-to-point; 200+ submissions get skimmed.
"A good submission is a small video presenting something big." Every segment below maps directly
to the scoring criteria: Creativity 30 · Implementation 20 · MCP Usage 20–40 · Submission ~30.

Screen recording (1920×1080 @ 60 FPS, browser zoom 110%) + crisp voiceover.
The chat acknowledgment in Shot 4 is the centerpiece — it is a *real* Fastn workflow executed from an AI chat, live.

---

## Shot List

| Time | On Screen | Say (Verbatim-ish) |
|---|---|---|
| **0:00–0:15** | **Live Dashboard & Welcome Strip**<br>Start directly inside PulseGuard. Welcome strip visible: *"PulseGuard watches how customers use your product — and warns you before they churn."* Dismiss welcome strip. Highlight the red pulsing `NEEDS ATTENTION` badge on Acme Corp ($48K ARR, sparkline falling to 38, delta `▾ 16% this week`). | "Customers rarely cancel out of nowhere — product usage fades weeks earlier. This is PulseGuard — an autonomous customer retention engine built on Fastn. Notice Acme Corp: weekly usage dropped sixteen percent, crossing our risk threshold." |
| **0:15–0:35** | **Sync Telemetry & Automated Detection**<br>Click **Sync Telemetry** (next to pulsing `● Autonomous Watch Active`). The row narrates sequential stages live: `Ingesting telemetry…` &rarr; `Evaluating retention thresholds…` &rarr; `Syncing CRM & #pulseguard-alpha…` &rarr; `Telemetry synced`. | "I click Sync Telemetry. In real-time, Fastn's risk engine ingests customer telemetry, evaluates the threshold, writes a diagnosis onto the CRM timeline, and alerts the right account channel — in seconds, per tenant." |
| **0:35–0:55** | **Multi-Channel Proof (Slack / HubSpot / Emails)**<br>Cut to Slack `#pulseguard-alpha` (Block Kit alert card) and HubSpot (Acme timeline note). Then click **Emails** (`/emails`): show full-width operations table, click the alert email to reveal the **Email Reader Modal** with delivery stepper (`Sent` &rarr; `Delivered`) and visual alert preview. | "Here is the delivered Slack card in #pulseguard-alpha, and the automated diagnosis on HubSpot CRM. On our Emails audit log, Fastn's Google Gmail connector confirmed delivery with a live trace stepper and risk acknowledgment link." |
| **0:55–1:25** | **The AI Assistant (Money Shot)**<br>Open the chat dock. Click `"Which account should I contact first?"`. Assistant answers with live telemetry prioritizing Acme Corp ($48K ARR). Click `"Acknowledge the Acme Corp risk"`. Tool card expands: `Approve tool call: acknowledge-risk`. Click Approve &rarr; executes real Fastn workflow `pulseguard-ack-loop`. Row flashes, status flips to `HANDLED`, KPI counts down to zero! | "And it's a closed loop with an AI assistant. The agent reads live telemetry, prioritizes my outreach — and acknowledges the risk *directly from chat*. That click executes a real Fastn workflow: CRM updated, alert cleared, dashboard synced." |
| **1:25–1:45** | **Multi-Tenant Isolation & 8-Connector MCP Catalog**<br>Switch workspace to **Tenant Beta (Globex Exports)**: show completely isolated data ($177.5K ARR, `#pulseguard-beta`). Open **Integrations** (`/integrations`): showcase the 8-connector MCP catalog with custom glowing red/green link buttons. Click Slack to show instant live ping toast to `#pulseguard-beta`! | "Every customer is an isolated workspace — own CRM, own Slack channel, zero data leakage. On our Integrations page, Fastn's 8-connector MCP catalog manages live connections with instant diagnostic pings and full tenant isolation." |
| **1:45–2:00** | **Activity Traces & Closing**<br>Click **Activity** (`/runs`). Show real-time trace: `ack-by-pulseguard-assistant` &rarr; `crm-note-appended` &rarr; `risk-badge-cleared`. Expand `Platform details` to reveal Fastn Org ID and workflow IDs. | "Every step executed on Fastn's governed runtime — and our backend was built by AI agents through Fastn's MCP gateway. PulseGuard: from telemetry to retained customers." |

---

## Why This Order Wins Maximum Points

- **0:15–0:55 is Implementation (20 pts)** — One continuous take, multi-channel verification across Slack, HubSpot CRM, and Gmail.
- **0:55–1:25 is Creativity + MCP (40 pts)** — An AI assistant that doesn't just talk, but *acts* through governed Fastn workflow execution (`pulseguard-ack-loop`). Emphasize: *"real Fastn workflow execution from chat"*.
- **1:25–1:45 is Multi-Tenant Isolation & MCP Ecosystem (30 pts)** — Enterprise workspace separation with 8-connector MCP grid.
- **1:45–2:00 is Fastn Governance & Traceability (30 pts)** — Live execution traces proving zero mocked state.

---

## Recording Checklist (Follow Exactly Before Pressing Record)

1. **Resolution & Display**:
   - Record at **1920×1080 @ 60 FPS** (OBS Studio or Loom with high-bitrate settings).
   - Set Chrome/Edge browser zoom to **110%** (ensures cards and tables fill the 1080p frame crisply without horizontal scrolling).
2. **Pristine State Reset**:
   - Open browser DevTools (`F12`) &rarr; Console, and run:
     ```javascript
     localStorage.clear();
     ```
   - Refresh the page (`Ctrl + Shift + R`). This ensures the **Welcome Strip** appears on first load, and the Activity log starts fresh.
3. **Window Layout**:
   - Main window: PulseGuard (`http://localhost:3210` or `https://pulseguard-app-nu.vercel.app`).
   - Second tab/window: Slack `#pulseguard-alpha` (or prepare screenshot `evidence/01-slack-card-alpha.png` to cut in).
   - Third tab/window: HubSpot Acme Corp timeline (or prepare screenshot `evidence/03-hubspot-timeline-note.png`).
4. **Pacing**:
   - Keep mouse movements smooth and deliberate. Pause for 0.5s on the pulsing `NEEDS ATTENTION` badge and the chat tool-approval card.
   - Total runtime must remain between **1:45 and 1:58** (strictly under the 2:00 cap).
