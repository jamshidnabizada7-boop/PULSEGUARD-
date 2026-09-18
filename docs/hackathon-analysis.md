# Build With Fastn — Hackathon Full Analysis

> Source: official onboarding session transcript (Day 1). This file is the persistent strategy
> reference for the whole hackathon. Status of our setup is tracked at the bottom.

---

## 1. Event facts (do not lose these)

| Item | Detail |
|---|---|
| Event | "Build With Fastn" hackathon — Fastn Inc. × MLS Sarmad (Microsoft Learn community, Islamabad) |
| Goal | Build a **customer-facing integration/embedding** using the Fastn platform |
| Prize pool | 300,000 PKR — **1st: 150K, 2nd: 100K, 3rd: 50K** |
| Day 1 | Online onboarding (this session) — building starts **immediately after** |
| Day 2 | **On-site at NUST (SEEKS building)** — networking, lunch, judging, prizes, swag |
| Entry gate | Original **CNIC** required (Form B if under 18). Names/CNICs pre-registered with NUST security |
| Prize rule | **Must be present on-site to receive prize**; check-in desks collect team info |
| Forms | TWO mandatory forms shared tomorrow on-site: **submission form** + **feedback form** |
| Team | 1 team lead required (prize money goes to team lead); members can be added |
| Org naming | Create Fastn organization named **`hackathon-<teamname>`** and invite teammates so progress is trackable |
| Progress check | Judges monitor who makes progress **today** — low activity = filtered out |

## 2. Judging criteria — the point math (most important section)

Total = 100 points. From the transcript:

| Criterion | Points | Evidence from session |
|---|---|---|
| **Creativity / idea** | **30** | "we have a solid 30 marks of creative thinking"; "if your idea is creative, you are definitely going to ace it" |
| **Implementation completeness** | **20** | "if there are 20 marks and your implementation is 10%, 20%, or 50%…" — judged on how much actually works at submission close |
| **MCP tool usage** | **20, but "we might increase it to 30 or 40"** | "the MCP tool is our main focus"; repeated 5+ times; they clearly want everyone building through MCP |
| **Submission quality** | **remainder (~30, shrinks if MCP goes to 40)** | demo video + screenshots + documentation + team details |

### Implication
MCP usage is the single biggest lever (20→40 possible) AND it's the thing most participants
will fumble (100-person Zoom capacity, complex OAuth setup). **We already have the MCP fully
connected and verified with 117 tools.** That advantage must translate into: the entire build
done through MCP tools, and the demo video explicitly showing the agent (ChatGPT/Copilot/Claude)
building the integration live.

## 3. What the judges said — verbatim signals to exploit

1. **"A good submission is a small video presenting something big."** Judges face 200+ videos;
   they cannot watch long ones. Demo video must be **short and point-to-point**:
   what was the problem → how you solved it → **where fastn is embedded** (show the third-party site).
2. **Tracks are NOT tracks.** The "use cases" tab (Slack→Teams alerts, Tableau export, SYN7↔HubSpot
   sync, multi-social posting) are **examples only**. Copying them scores poorly; "there's a specific
   point, 30 points for creative thinking… create something creative which can give you a lot of marks."
   A participant was told directly: "those use cases were just an example… be as much creative as you can."
3. **Feedback form = free points.** "Each of the things you report… if your feedback is valid, you have
   higher chances of getting a lot of points." Known bugs already mentioned in the session:
   Slack OAuth failing for some participants, team-invite notifications not arriving.
   Reporting real bugs from our own testing is a scoring action, not a side quest.
4. **Credits warning.** Every account has 50 credits. The **platform agent burns credits**;
   the upgrade is one-time and won't be repeated. **MCP usage has no such credit limitation**
   ("if you connect to your MCP tool, there's no limitation"). Strategy: do EVERYTHING through MCP.
5. **If using MCP, do NOT fill the account-upgrade form** — it's only for people who can't use MCP.
   Filling it wrongly signals we didn't understand the flow (minor, but avoid).
6. **Embedding pages are acceptable front-ends.** We don't need to build a full website —
   Fastn's embedding pages "act as a front end… share that embedding page with anyone, and they can
   connect their own account using multi-tenancy." But a small custom site with the iframe widget
   embedded makes the "customer-facing" story stronger (embedding into "your third-party website" is
   explicitly in the demo-video rubric).
7. **Early submissions accepted.** "If you can come tomorrow… create a demo video and share it with
   us before time, we definitely accept it." Building starts now; don't wait for Day 2.
8. **Multi-tenancy is a core platform concept** judges expect to see understood: each customer/tenant
   connects their own credentials; workflows process each tenant's data in isolation.

## 4. Platform capability map (what we can build with — via our 117 MCP tools)

- **Workflows** (the core): instant (<10s, real-time response), standard (<1h background),
  long-running (5–20h+). AI agent builds real code in the background; draft vs live versions;
  version history; test cases auto-generated; run/test from UI.
- **Triggers**: webhooks (endpoint receives events), schedulers (e.g. every 10 min),
  app events (native events from apps like HubSpot — "lead qualified" → trigger workflow).
- **Connectors**: 200+ managed community connectors + **custom connectors** built via the agent
  (a separate points track — "adding to the library that Fastn already has… you can earn points").
- **Unified APIs**: one endpoint fan-out to many connectors (post once → Facebook+LinkedIn+email+Instagram).
- **Widgets / embedding**: iframe embed or hosted embedding page; theme editor (colors, font,
  light/dark); feature toggles; per-tenant switching; shareable preview links.
- **Observability**: activity, traces, executions (rerun + investigate with agent), sync reports, alerting.
- **Platform admin**: orgs, people/invites, API keys, MCP keys, secrets, environments.

## 5. Winning playbook

### Idea selection filter (must pass ALL)
1. Solves a real, felt problem for a *specific* customer persona (problem story for the video).
2. Requires **multiple connectors talking to each other** (shows platform depth).
3. Has a natural **customer-facing embedding moment** (widget in a website/dashboard).
4. Uses a **trigger** (webhook/scheduler/app-event) — judges listed these explicitly as platform pillars.
5. NOT one of the four example tracks (or a clearly non-obvious twist on them).
6. Buildable end-to-end within the window via MCP only.

### Build order (each step done through MCP tools, screen-recordable)
1. Create org `hackathon-<teamname>`, invite teammates (UI, one-time).
2. Call `skill {"slug":"gateway"}` — the gateway's own mandatory operating manual.
3. Explore connectors → pick the stack for the chosen idea.
4. Build workflow(s) + trigger + test cases via MCP; iterate until executions are clean.
5. Create widget, theme it, embed via iframe into a minimal demo site (or use embedding page).
6. Test multi-tenancy: connect 2 different tenants, show isolated data.
7. Capture screenshots of workflows + embedded site as we go.
8. Record the 2–3 min demo video: problem → agent building via MCP → embedded product → live run.
9. Write short doc (Google Doc): problem, architecture (which connectors/triggers/workflows), screenshots.
10. Submit both forms on Day 2 + file valid bug reports found during our build.

### Scoring checklist mapping
- [ ] MCP used end-to-end (20–40 pts) — demo video must SHOW the agent doing it
- [ ] Creativity (30 pts) — idea not from examples, novel persona/problem
- [ ] Implementation (20 pts) — working end-to-end, clean executions, published live version
- [ ] Submission (~30 pts) — short video, screenshots, doc, team details, both forms
- [ ] Bonus: valid bug reports via feedback form
- [ ] Bonus consideration: custom connector contribution (separate points track)

## 6. Risks & gotchas

- **Never say "hi" to the platform agent** (burns credits; they literally warned about this).
- Do **not** fill the credit-upgrade form (we're MCP users).
- Bring original CNIC (Form B if minor) tomorrow; no CNIC = no entry = no prize eligibility.
- Org must be shared with team members; untracked solo progress weakens "team" evaluation.
- Prize goes to the team lead listed on the submission form.
- Slack OAuth was flaky during the session — have a backup connector choice in case OAuth fails.
- Video length discipline: 200+ submissions; anything >3–4 min risks not being fully watched.

## 7. Our setup status (updated as we go)

- [x] Fastn MCP server connected to ZCode via `mcp-remote` (OAuth login completed, token cached in `~/.mcp-auth`)
- [x] Gateway verified: "Fastn Connect v0.1.0", **117 tools** live (fastnPlatform__*, search_tools, run_tool, skill, …)
- [ ] Call `skill {"slug":"gateway"}` and internalize the gateway manual
- [ ] Team/org setup (`hackathon-<teamname>`)
- [ ] Idea selected (see §5 filters)
- [ ] Build, embed, record, submit
