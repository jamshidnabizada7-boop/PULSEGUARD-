# Demo Video Script — 2:00 (Hard Cap for Submission)

**Rules from the organizers:** Short and point-to-point; 200+ submissions get skimmed.
"A good submission is a small video presenting something big." Every segment below maps directly
to the scoring criteria: Creativity 30 · Implementation 20 · MCP Usage 20–40 · Submission ~30.

Screen recording (1920×1080 @ 60 FPS, browser zoom 110%) + crisp voiceover.
The **AI Chatbot actuation** in Shot 3 is the centerpiece — it is a *real* Fastn workflow executed from an AI chat, live.

---

## Shot List

| Time | On Screen (What You Click / Show) | Say (Verbatim Voiceover) |
|---|---|---|
| **0:00–0:15** | **Live Dashboard & Problem Hook**<br>• Start on live Dashboard (`localhost:3210` or Vercel).<br>• Welcome Strip is visible at top: *"PulseGuard watches how customers use your product — and warns you before they churn."*<br>• Dismiss welcome strip with one click (`Explore on my own`).<br>• Slowly hover over Acme Corp ($48K ARR, health sparkline dropping to 38, delta `▾ 16% this week`, pulsing red `NEEDS ATTENTION` badge). | "Customers rarely cancel out of nowhere — product usage fades weeks earlier. This is PulseGuard — an autonomous customer retention engine built on Fastn. Notice Acme Corp: weekly usage dropped sixteen percent, crossing our risk threshold." |
| **0:15–0:35** | **Autonomous Telemetry Ingestion & Real-Time Alerting**<br>• Click **Sync Telemetry** (next to pulsing `● Autonomous Watch Active`).<br>• Watch the row narrate sequential stages live: `Ingesting telemetry…` &rarr; `Evaluating retention thresholds…` &rarr; `Syncing CRM & #pulseguard-alpha…` &rarr; `Telemetry synced`.<br>• Show multi-channel proof: cut briefly (2s) to Slack `#pulseguard-alpha` (Block Kit card) and HubSpot (Acme timeline note).<br>• Click **Emails** (`/emails`): show full-width operations table, click top email to open the **Email Reader Modal** with delivery stepper (`Sent` &rarr; `Delivered`) and visual alert preview. | "I click Sync Telemetry. In real-time, Fastn ingests customer telemetry, evaluates the threshold, writes a diagnosis onto HubSpot CRM, and alerts the right Slack channel and account manager email — in seconds, per tenant." |
| **0:35–1:15** | **THE AI CHATBOT (THE CENTERPIECE & MONEY SHOT)**<br>• Click the bottom-right floating pill: **`● AI Assistant`** (or chat icon).<br>• Cursor-style chat dock slides open smoothly, shifting the dashboard content aside.<br>• **Step 1**: Click the suggestion chip: **`"Which account needs attention?"`**<br>  &rarr; Chatbot answers in plain English using live telemetry: *"Start with Acme Corp — it's your largest at-risk contract ($48,000 ARR, health down to 38/100, about 16% lower than last week)..."*<br>• **Step 2**: Click **`"Acknowledge the Acme Corp risk"`**.<br>  &rarr; Chatbot dynamically renders an interactive **Fastn Tool-Call Card**:<br>    `Tool: acknowledge-risk`<br>    `Workflow: pulseguard-ack-loop (wf_4afb70d49708)`<br>    `Customer: Acme Corp \| Tenant: tenant-alpha`<br>• **Step 3**: Click the tool card chevron to show the governed Fastn workflow ID, then click **Approve** (or watch it execute) &rarr; flips to `✓ Completed`!<br>• **Step 4**: Highlight the live dashboard right next to the chat:<br>  &rarr; The Acme Corp row flashes!<br>  &rarr; The red badge flips to green **`HANDLED`**!<br>  &rarr; Top KPI "Accounts at risk" counts down from **1 to 0**!<br>• **Step 5**: Ask the chatbot: **`"What just happened?"`**<br>  &rarr; Chatbot recaps: *"The most recent run was just now: Acme Corp went through the acknowledgement loop and Risk handled. Every internal step succeeded — the full trace is on the Activity page."* | "And here is the centerpiece: our built-in AI chatbot. The assistant reads live telemetry, explains risk in plain English, and prioritizes outreach. Even better, I tell the chatbot to acknowledge the risk directly from chat. That triggers a real Fastn workflow: the tool card executes, the CRM updates, the dashboard flips to Handled, and the KPI drops to zero — a complete autonomous closed loop." |
| **1:15–1:40** | **Multi-Tenant Isolation & 8-Connector MCP Catalog**<br>• Click workspace switcher at bottom of left sidebar: switch to **Tenant Beta (Globex Exports)**.<br>• Show completely isolated customer data ($177.5K ARR, `#pulseguard-beta`, threshold 35%). Zero leakage.<br>• Click **Integrations** (`/integrations`): showcase the 8-connector MCP catalog with custom glowing red/green link buttons.<br>• Click the Slack link button to trigger the instant green test ping toast: *"Slack ping dispatched successfully to #pulseguard-beta"*! | "Every customer lives in an isolated workspace — own CRM, own Slack channel, zero data leakage. On our Integrations page, Fastn's 8-connector MCP catalog manages live connections with instant diagnostic pings and full tenant isolation." |
| **1:40–2:00** | **Activity Audit Traces & Closing**<br>• Click **Activity** (`/runs`) in sidebar.<br>• Show ordered internal execution steps: `ack-by-pulseguard-assistant` &rarr; `crm-note-appended` &rarr; `risk-badge-cleared`.<br>• Expand **Platform details** to reveal Fastn Org ID `personal_dc05aac8b2c7b361ba84` and workflow IDs.<br>• End on strong closing statement. | "Every single step ran on Fastn's governed runtime — and our backend was built by AI agents through Fastn's MCP gateway. PulseGuard: from telemetry to retained customers, powered by Fastn." |

---

## Why This Flow Wins 1st Place

- **0:15–0:35 is Implementation (20 pts)** — One continuous take, multi-channel verification across Slack, HubSpot CRM, and Gmail.
- **0:35–1:15 is Creativity + MCP (40 pts - Centerpiece)** — The AI Chatbot is actively used to analyze risk, prioritize outreach, and execute real Fastn workflows from chat with live dashboard actuation.
- **1:15–1:40 is Multi-Tenant Isolation & MCP Catalog (30 pts)** — Strict workspace separation with 8-connector MCP grid.
- **1:40–2:00 is Fastn Governance & Traceability (30 pts)** — Live execution traces proving zero mocked state.

---

## Pre-Recording Protocol Checklist

1. **Display & Browser**:
   - Resolution: **1920×1080 @ 60 FPS** (OBS Studio or Loom with high-bitrate settings).
   - Browser Zoom: **110%** (ensures cards and tables fill the 1080p frame crisply without horizontal scrolling).
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
