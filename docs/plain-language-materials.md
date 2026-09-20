# PulseGuard — Plain-Language Materials (for the video & submission)

Everything here is in simple words. Use it for the video voiceover, the submission
form, and answering judges. One name note: the demo product (dashboard) is
"PulseGrid", and "PulseGuard" is the smart engine inside it. In the video, just
say **PulseGuard** for everything — simpler.

---

## 1. What is it? (say this in 20 seconds)

> PulseGuard is a smoke detector for losing customers.
>
> When a company buys software like ours, its people use it every day. When
> they are about to cancel, they quietly stop using it — weeks before they
> leave. Today, that warning hides inside usage numbers, and the team that
> could save the customer never sees it.
>
> PulseGuard watches those numbers. When one customer starts slipping, it
> writes a note on their page in the CRM, sends a warning card to the team's
> Slack, and waits for one click to say "we're handling it." Then it updates
> everything by itself.

## 2. The problem it solves (plain)

- Customers leave slowly, not suddenly. The signs show up weeks early.
- The signs live in one place (usage data). The people who can help live in
  two other places (CRM and Slack). Today, nobody connects them in time.
- Companies lose paying customers not because the product was bad, but
  because **nobody noticed in time**.

**PulseGuard connects the sign to the action — automatically.**

## 3. How it works — 5 simple steps

1. **Watch** — PulseGuard keeps an eye on how each customer uses the product.
2. **Notice** — if one customer's usage drops too much in a week, it flags them.
3. **Write** — it puts a short note on that customer's page in the CRM. Nobody
   has to write it.
4. **Tell** — it sends a card to the team's Slack channel with an
   "Acknowledge" button.
5. **Close** — one click (in Slack, on the dashboard, or by asking the AI
   helper) and it updates the CRM again and clears the warning.

Each customer of ours gets their **own private space** — their own CRM
connection, their own Slack channel. Nothing ever mixes between them.

## 4. What makes it special (three lines for judges)

1. **It acts, it doesn't just alert.** The note in the CRM is written
   automatically. The follow-up is one click that changes real records.
2. **You can talk to it.** The AI helper inside answers questions using real
   numbers — and it can do the work for you: "handle Acme Corp" runs a real
   workflow.
3. **It was built by AI, through Fastn.** Every workflow and connection was
   created by AI agents using Fastn's developer tools — not clicked by hand.

---

## 5. Video script — 2:00 (simple words)

Recording: screen capture at 1920×1080 + voiceover. Speak slowly. Pause at
every (.) Full word-for-word lines below — read them as they are.

### Before recording (checklist)
- Open 3 windows: PulseGuard dashboard, Slack `#pulseguard-alpha`, HubSpot
  (Acme Corp page).
- Turn OFF all notifications.
- On the dashboard, press "Reset demo history" on the Activity page once, then
  do one warm-up run so rows are not empty.
- Clear your browser's localStorage for the site if you want the welcome bar
  to show (it makes a nice first shot).
- Read each line out loud twice before recording.

### Shot list (say it exactly like this)

| Time | What you click / show | What you say (read as written) |
|---|---|---|
| 0:00–0:10 | Slide with big text: **"Customers leave quietly."** | "Customers leave quietly. They stop using your product weeks before they cancel. PulseGuard notices — and acts, end to end." |
| 0:10–0:30 | Dashboard. Slowly move the mouse over the red row (Acme Corp). | "This is PulseGuard. It watches how customers use your software. See this red row? This customer is using it sixteen percent less this week. That is a warning sign." |
| 0:30–0:55 | Press **Simulate Anomaly**. Show the row telling you each step. Then switch to the Slack window and show the card that arrived. | "I press one button. PulseGuard checks the account, writes a note in the CRM, and sends a message to the team on Slack — all by itself, in seconds." |
| 0:55–1:10 | HubSpot window. Scroll to the new note on Acme's page. | "Here is the note — right on the customer's page in the CRM. Nobody wrote it. The system did." |
| 1:10–1:40 | Back to the dashboard. Open the chat (bottom-right). Click **"Which account needs attention?"** — let it answer. Then click **"Acknowledge the Acme Corp risk."** Show the row turn green and the number go to zero. | "Now the best part. I ask the helper: which customer should I call first? It answers with real numbers. Now I tell it: handle Acme Corp. It did the work for me — the CRM is updated, the warning is gone. All real. All automatic." |
| 1:40–1:50 | Use the sidebar switcher at the bottom left: change to **Tenant Beta**. Show the different data. Quick flash of the Integrations page. | "Every customer gets their own private space — their own CRM, their own Slack channel. They never mix." |
| 1:50–2:00 | Slide: **"Built by AI agents on Fastn"** + the Activity page traces behind it. | "Every step ran on Fastn — the platform this is built on. And the backend was built by AI agents, through Fastn's tools. PulseGuard: keep your customers, before they leave." |

### After recording
- Watch it once fully. If a shot feels rushed, record only that shot again and
  cut it in — do not redo the whole video.
- Total must be **2:00 or less**. The timer is on the submission rules.
- Upload as unlisted YouTube or Loom. Put the link in the submission form first.

---

## 6. Text for the submission form (copy-paste)

**What is your project? (short answer)**

> PulseGuard is a smoke detector for losing customers. When a company's
> employees quietly stop using our software, that is the first sign they will
> cancel. PulseGuard watches for that drop, writes a warning note on the
> customer's CRM page, and sends the team a Slack alert — all by itself. When
> someone presses "Acknowledge", a second workflow updates the CRM and closes
> the loop. You can even tell the built-in AI assistant to do it for you, and
> it runs a real workflow. Every customer lives in their own private space, so
> nothing mixes between them. The whole backend was built by AI agents through
> Fastn's developer tools.

**What problem does it solve? (short answer)**

> Companies lose customers quietly: usage fades weeks before cancellation, but
> that warning lives in usage data while the team works in the CRM and Slack.
> Nobody connects them in time. PulseGuard connects the warning to the action
> automatically — detect, write, alert, and close the loop — with zero
> engineering in the middle.

---

## 7. Judge questions — simple answers (keep on a paper next to you)

**"What is Fastn's role in your project?"**
> Fastn is the engine in the middle. It stores the rules, connects to HubSpot
> and Slack for us, keeps each customer's data separate, and runs every step.
> We also connected Fastn's developer tools (MCP) to AI agents, and those
> agents built the workflows for us.

**"What did the AI actually build?"**
> The two workflows (the one that finds risk and the one that closes the
> loop), the widget settings, and the tenant connections — all created and
> deployed by agents calling Fastn's tools. The build log is in our repo.

**"Is the chat assistant real AI?"**
> Yes. It reads the real numbers on the screen and answers in plain words. And
> when you tell it to handle a risk, it runs a real workflow on Fastn — the
> same one the button runs. It is not a demo recording.

**"What happens if two alerts happen for the same customer?"**
> The second one is blocked for 30 minutes, so the team gets one clear message
> instead of spam. You can see that on the Activity page — "Duplicate blocked."

**"Why is this better than just an alert?"**
> An alert tells you there is a problem. PulseGuard also writes the diagnosis
> in the CRM, gives you one click to close the loop, and updates the record
> after. The team saves time and nothing is forgotten.

**"What was the hardest part?"**
> Making multi-tenant isolation real: each customer's alerts and CRM writes
> are scoped by an ID on every request, so Acme's alerts can never appear in
> Globex's channel. We also found and documented 8 Fastn platform bugs while
> building.

---

## 8. 30-second pitch (if a judge stops you in the hallway)

> "Companies lose customers quietly — usage drops weeks before they cancel,
> and nobody notices. PulseGuard notices. It writes the warning in the CRM,
> sends the team a Slack card, and one click closes the loop. You can even ask
> the AI helper inside to do it for you — and it runs a real workflow. All of
> it was built by AI agents on Fastn. Smoke detector, for churn."
