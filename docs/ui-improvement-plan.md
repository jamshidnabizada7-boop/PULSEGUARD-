# PulseGuard UI Improvement Plan — Catching the Judges' Eyes

> Companion to `demo-video-script.md`. The submission deliverable is a **≤ 2:00 video**,
> so the UI's only job is to make 120 seconds of screen recording feel premium, obvious,
> and worth a rewatch. This doc records (A) what was redesigned on `main` already and
> (B) the prioritized plan for what to improve next, mapped to the actual scoring rubric
> (Creativity 30 · Implementation 20 · MCP usage 20–40 · Submission quality ~30).

---

## A. What was redesigned (shipped)

The dashboard was restyled from a "hacker dashboard" look (blue-navy, cyan glow on every
number, Plus Jakarta Sans, busy badges) to a restrained, Cursor-inspired design system:

| Area | Before | After |
|---|---|---|
| Base palette | Blue-tinted navy `#070a12`, cyan glows everywhere | Near-black neutral `#09090b` with layered white-alpha panels, hairline borders (`rgba(255,255,255,.07)`) |
| Accents | Cyan on everything | Violet primary (`#8b5cf6`) + cyan reserved for live/data signals; semantic colors (rose/emerald/amber) only where meaningful |
| Typography | Plus Jakarta Sans, glowing text-shadows | Inter with tight tracking (`-0.02/-0.035em`), **tabular numerals** on every metric and timestamp |
| Texture | Flat gradients | Faint dot-grid that fades out below the fold, soft radial brand glow, 1px top-edge highlights on cards |
| KPI cards | Number + glow | Icon chip, tabular number, delta context row |
| Accounts table | Score only | Score + **WoW delta chip** (red only for real drops ≥5%, neutral gray for ±1–4% noise) + risk-colored sparkline |
| Pipeline card | 5 boxes | 5 boxes with glowing step dots and `→` connectors — reads as a flow, not a grid |
| Primary CTA | Gradient button | Brand-gradient CTA with a light-sweep hover animation — the video "money button" |
| Toast | Cyan-bordered | Dark glass, accent left-edge |
| Runs page | Same system | Tenant color coding: **Alpha = violet, Beta = cyan**, echoed in the segmented filter and tenant chips |
| Integrations | Mixed hardcoded blues | Full palette swap to the neutral system; HubSpot orange / Slack purple brand icons kept for instant recognition |

**Why this direction:** judges skim 200+ videos. Neutral-dark + one accent family reads
"professional product" in the first 3 seconds; semantic color then does the storytelling —
the eye lands on the one red row (the risk) without being told where to look.

Files touched: `app/globals.css` (full design system rewrite), `app/layout.jsx` (Inter),
`app/TopBar.jsx`, `app/page.jsx`, `app/runs/page.jsx`, `app/integrations/page.jsx`.
No logic changed: simulate, ack loop, tenant sync, and localStorage run feed are untouched.

---

## B. What to improve next (prioritized for judges)

### P0 — do before recording (high judge impact, hours not days)

1. **Trim the video script from 2:30 → ≤2:00** (`docs/demo-video-script.md`).
   Cuts: shorten the 0:00–0:20 problem slide to 10s (keep the churn graph), merge the
   integrations walkthrough into one 15s pass (the new UI already shows both connectors
   as CONNECTED — no need to narrate each), and tighten the agent-build proof to one
   12s B-roll shot of the MCP tool call + workflow executing.
   *Impact: Submission quality — organizers explicitly said "a good submission is a small
   video presenting something big."*

2. **Live "Fastn is executing" feel during the money shot.** When **Simulate Anomaly** is
   clicked, the button already shows "Dispatching to Fastn…". Add a 3-step progress
   shimmer on the risk row (CRM note → Slack card → done) driven by the run entry that
   `/api/telemetry` already returns, so the row visibly "receives" the alert while the
   narrator says "in seconds". File: `app/page.jsx` (`simulate()`), CSS keyframe only.
   *Impact: Implementation + Creativity — makes the closed loop feel actuated, not animated.*

3. **Count-up animation on KPI numbers** when the anomaly lands (risk count 0→1, ARR
   guarded stays). 400ms, `requestAnimationFrame`, no library. File: `app/page.jsx`.
   *Impact: video polish for near-zero risk.*

### P1 — strong differentiators (do if time allows)

4. **Slack card mirror on the dashboard.** A small "Last alert delivered" card under the
   accounts table rendering the actual Block Kit payload (title, metrics, Acknowledge
   button) that landed in Slack. Judges see both sides of the loop without leaving the
   product shot. Data source: extend `/api/runs` run entry with the Slack message permalink.
   *Impact: Creativity — "the dashboard shows what the customer's CS team actually saw."*

5. **Runs page: execution trace as a horizontal stepper**, not wrapped chips. The trace
   (`dedupe-ok → table-ok → unified-getAccount-ok → …`) is the MCP-governance proof;
   render each step as a node on a line with green check icons and durations.
   File: `app/runs/page.jsx`. *Impact: MCP usage — visually proves the multi-workflow
   governed execution, the criterion they said may be worth 40.*

6. **Empty-state upgrade on Runs.** Replace the text-only empty row with an illustration
   card ("No executions yet — trigger your first anomaly") + a one-click CTA button.
   Prevents a dead-looking screen if the demo order changes. File: `app/runs/page.jsx`.

### P2 — nice-to-have (only if everything above is done)

7. **Favicon + social preview** (`app/icon.svg` — the pulse-wave mark on the brand
   gradient; og:image for the submission form link).
8. **`prefers-reduced-motion`** guard for the pulse/sweep animations (accessibility point
   in writeups).
9. **Keyboard shortcut** (`S` to simulate, `A` to acknowledge) — only mention in the
   voiceover if recorded; skip otherwise.

### Explicitly not worth it before the deadline

- Light theme, i18n, charts library migration, component-library refactor (Tailwind/shadcn).
  High regression risk, invisible in a 2-minute video.

---

## C. Shot adjustments for the new UI (update to the video script)

| Script beat | Change with the redesign |
|---|---|
| 0:20–0:40 dashboard intro | Start on Tenant Alpha; the gradient hero text ("Retention Loop") frames the product name — hold 2s before scrolling. |
| Simulate click | The CTA now has a light sweep — zoom-level 110% keeps it crisp; the row flashes rose on anomaly (keep the default 2.6s animation). |
| Acknowledge click | Row flashes sky-blue and badge flips to ACKNOWLEDGED — same take as the Slack click-through for the closed-loop cut. |
| Tenant switch | Use the topbar switcher on camera: Alpha (violet chip) → Beta (cyan chip) makes multi-tenancy legible without narration. |
| Runs page | Show the Alpha/Beta color-coded stream for 3s — it doubles as the execution-audit proof. |

## D. Recording checklist additions

- [ ] Verify Inter loaded (no fallback font flash on first frame) — reload 2s before recording starts.
- [ ] 1440×900 or 1920×1080 browser window; the topbar badges are designed not to wrap at these widths.
- [ ] Clear `localStorage.pulseguard_runs` before the take so the Runs page starts clean, then let the live run populate it.
