# Decisions — dreamcatcher-showcase

> Routing rule (Work Item Routing Standard): this file records **decisions with
> rationale** (lightweight ADRs). If a future engineer would ask "why is it like
> this?", the answer belongs here. Defects → `ISSUES.md`; ideas →
> `FEATURES-BACKLOG.md`; sequencing → `ROADMAP.md`.

## 2026-09-11 — Stood up as a standalone showcase repo, modeled on grant-tracker-showcase

**Decision:** extracted `portofolio-hub/apps/dreamcatcher` into this standalone
repo as the per-reveal public showcase, following the same model as
`grant-tracker-showcase` and `finance-freedom-showcase` (private until the
Sep 17 reveal, then becomes the canonical dev home; the monorepo copy becomes
a mirror per the deferral rule).

**Rationale:** the per-reveal showcase-repo pattern (decided 2026-08-20, see
portfolio memory) restores the original intent of the public demo repos — "a
stripped-down demo/showcase of the aspirational production state with docs and
specs, without giving away the keys to the kingdom" — in disciplined form:
BCSTANDARDS + an honest real-vs-illustrative boundary table + a ported release
gate suite (whiteglove/mobile/viewport sweeps, anchor-coherence unit gate,
fabricated-signal grep-gate), rather than the divergent full-stack demo forks
this portfolio drifted into earlier in the year.

## 2026-09-11 — Ground every public claim in the audited state, not the engine's own README

**Decision:** this repo's README, BCSTANDARDS, and eventual case-study/
reveal-meta content describe Dreamcatcher's real, audited capability (real
OpenAI wiring across 7 endpoints, 1149 real tests, genuine retro-tracing and
citation-graph model) — never the production engine README's own marketing
copy (SaaS pricing tiers, a 1000+-template marketplace, a mobile app, ARR
projections against unchecked `Q1 2025` roadmap boxes).

**Rationale:** a 2026-08-19 cross-portfolio audit flagged "AI-powered branding
riding on deterministic algorithms" as the single dominant credibility risk
across this whole reveal season. The engine's own README is written as product
marketing for an aspirational commercial future, not a description of what's
built — using it as source material for public-facing copy would reintroduce
exactly the honesty gap the 2026-08-24 representativeness plan (fabricated
confidence numbers, missing differentiator features) was written to close.

## 2026-09-11 — No RBAC/persona model in this demo

**Decision:** Dreamcatcher ships as a single-user personal workspace here —
no role switcher, no persona-based visibility, unlike Grant Tracker's
RBAC-gated reallocation workflow or Ops Command Center's access model.

**Rationale:** real-time collaboration (which would motivate a
multi-user/role model) is a production roadmap item, not an audited, built
capability — depicting a persona switcher here would overstate the product's
actual multi-user maturity. One signed-in workspace owner with full access is
the honest scope.

## 2026-09-12 — Mobile companion surface: bottom tabs + surface-scoped desk-only, not a reflowed desktop

**Decision:** below 900px, Dreamcatcher gets a genuine mobile-native
companion shell instead of the rail-collapses-into-a-strip treatment it had
before: a bottom tab bar (Today / All Dreams / Inbox / More) is the primary
nav, `.fn-rail` is `display:none` (not collapsed — gone), and three routes
render a designed "stays at the desk" screen instead of their authoring UI
on a phone: **Builder Notes**, the **Case Study Composer**, and **Graph**.
Revisions and Settings are deliberately *not* desk-only.

**Per-surface rationale:**
- **Builder Notes → desk-only.** Long-form direction copy paired with a
  proof matrix (`builder-matrix`, already given `overflow-x: auto` +
  `min-width: 920px` on desktop) that's meant to be scanned side-by-side —
  authoring-adjacent reference material, not a triage task.
- **Case Study Composer → desk-only.** Composing means arranging sections,
  media, and narrative against each other while drafting — a desktop
  authoring surface by nature, not something a phone form should attempt.
- **Graph → desk-only.** The core interaction is clicking one specific
  citation edge among several packed close together on a wide,
  horizontally-laid-out SVG timeline to read its quote. That needs a
  precise pointer and real screen width; a thumb on overlapping edges at
  phone width would misfire more than it would work. This is a "does the
  core interaction survive at phone width" call, not a blanket
  "visualizations are desk-only" rule.
- **Revisions → stays a companion surface.** Its core interaction is
  reading one card of proposed-split evidence and pressing exactly one of
  two buttons (Ratify / Reject) — genuinely usable at phone width with no
  loss of the interaction's substance. Cardify/reflow wasn't even needed;
  the existing `.revision-card` layout already reads fine narrow.
- **Settings → stays a companion surface.** It's rows of toggles and
  `<select>`s across ten tabs — tall on a phone, not unusable. No single
  panel demands desktop screen real estate the way Builder Notes' matrix or
  Graph's edge-picking does.

**Rationale (the mechanism):** ported two already-proven patterns rather
than inventing a new one: `grant-tracker-showcase`'s bottom-tab-bar +
"More" nav-sheet shape (`mobile-tabs.jsx`), and
`ops-command-center-showcase`'s `DESK_ONLY_VIEWS` surface-scoped-authority
policy (checked against `route.kind`, including deep links, not just nav
clicks — a saved/restored route into a desk-only view gets the honest
screen too). Dreamcatcher's content model has no tables to run
`cardify.js` against, so the card treatment for All Dreams / Archive /
Inbox is content-specific rather than a drop-in port — see
`docs/ISSUES.md` (2026-09-12 entry) for what shipped there.

## 2026-09-12 — Settings' section nav is a native `<select>` on phones

**Decision:** below 900px the Settings sidebar nav (`.settings-nav`, ten
sections) is hidden and replaced by a native `<select>` (`.settings-jump`),
not by a horizontally-scrolling strip of section pills.

**Rationale:** the owner has rejected "the left nav collapses into a
horizontally-scrolling row of pills at the top of the page" outright, three
projects running (2026-09-12 feedback, recorded in memory). A native select is
the genuinely mobile-native control for "jump to one of N sections" — it opens
the OS picker sheet on iOS/Android, costs one 44px row, and needs no scrolling
affordance. The desktop sidebar is untouched; both are rendered and CSS swaps
their visibility, so the tour and the sweeps can target whichever exists.

## 2026-09-12 — The onboarding tour derives its steps from the shell it finds

**Decision:** `FieldNotebookTour` builds its step list at open time from
`matchMedia` facts (rail vs bottom tab bar below 900px; dream-detail rail
hidden below 1024px; Settings sidebar vs section picker), and skips forward if
a target is in the DOM but renders at zero size.

**Rationale:** the companion-surface doctrine (ops-command-center cycle,
2026-08-31) says guided tours skip steps that narrate surfaces the device does
not show. A static step list spotlighted `display:none` elements on phones
(tour card top-left, no spotlight, copy about a rail that does not exist).
Deriving from the rendered shell keeps one tour component honest on every
width instead of maintaining two lists that drift.

## 2026-09-12 — The sweep runner falls back to a free loopback port

**Decision:** `scripts/run-release-sweeps.mjs` still prefers the fixed port
3310 (strict), but when 3310 is busy it starts the preview on the next free
loopback port and passes that URL as `BASE_URL` to every sweep.

**Rationale:** the 2026-09-03 decision fixed a strict port so the sweeps can
never accidentally validate the deployed Vercel site. That rule is about the
target (the locally built candidate), not the port number: any loopback port
the runner itself started satisfies it. A leaked preview from an interrupted
earlier run held 3310 for hours today and turned every gate run into
"Port 3310 is already in use" — a gate that cannot run is worse than a gate
on a different local port.

## 2026-09-12 — One event log behind every activity figure

**Decision:** the heatmap, weekly bars, streak, activity-per-week and
busiest-weekday figures derive from the dated records the rest of the demo
already renders (fragment dates, done-todo deadlines, versions, documents,
retros, inbox captures, archive dates, decided suggestions) via
`buildActivity()` in `insights.js` — not from a separate synthetic activity
pattern. A `SUGGESTION_LOG` fixture records past decisions so the "AI
accepts" rate is a real ratio.

**Rationale:** the checklist's rule is one canonical dataset. A hand-tuned
84-day pattern looked like data but was a second source: it produced a
"17-day streak" beside a derived "+0 fragments this week" on the same page.
Deriving from the real records makes the heatmap sparser and the streak
shorter — and true. Where the fixtures lacked a fact (decision history), the
fact was added to the fixtures, not typed into the view.

## 2026-09-12 — Landing gate is session-scoped; sign-out replays onboarding

**Decision:** `fn:session:v1` lives in `sessionStorage`; sign-out removes
both it and the once-ever onboarding flag.

**Rationale:** polish checklist §4 (08-20): a persistent flag dropped the
owner straight into an app on reveal day, bypassing the pitch. Here the auth
screen is the landing; a fresh visit must see it, and a visitor must be able
to replay landing → tour → app from sign-out.

## 2026-09-16 — Ratify applies the split; revert restores it

**Decision:** on the Revisions surface, ratify now APPLIES the proposed
artifact-anchored split to the demo workspace — four dreams created from a
conflated origin backlog (a new fixture dream, id 9, modeled on the engine's
first real proposal), each taking the fragments the trace attributed to its
artifact; the origin archived with the reason recorded; the Graph re-derived
with the proposal's quoted links as edges — and **revert** restores the
workspace byte-for-byte (`tests/revision-apply.test.mjs` proves the round
trip). The decision persists (`fn:revision:v1`); restoring the origin from
Archive is the same revert. Reject records the decision and changes nothing.

**Rationale:** the T-1 review asked whether the case study "truly flexes" the
product. The previous demo stopped at "ratified — no workspace data changed",
which was honest but demonstrated nothing: the workflow the case study sells is
that a human's ratification changes the workspace, recorded and reversible.
The polish checklist's own ladder (§4: do the real thing when it is cheap on
mock data) applies. Pure functions over the dreams array keep it testable and
keep the human decision the only trigger.

## 2026-09-16 — No 3D "molecule" graph; the Graph stays deterministic and 2D

**Decision:** the Graph view keeps its SVG capture-order layout (`GraphView.jsx`
`layout()`: position derived purely from capture index). No force-directed or
3D "molecule" rendering (Obsidian / Notion-graph style) ships in this demo, not
for the Sep 17 reveal and not as a default view afterwards.

**Rationale:** the owner asked (T-1, 2026-09-16) whether the popular 3D
molecule look could be produced. It can, technically (a 3D force-graph library,
a few hundred lines), but it contradicts the page's own printed claim: "nodes
are laid out in capture order — same data, same layout, every time; no edge is
drawn from similarity or co-occurrence." A physics layout re-arranges on every
load and its clusters read as similarity, which is exactly what production does
not compute. The molecule would look like the competitors and undercut the one
thing that differentiates this graph: every edge is a citation. It would also
need a WebGL accessibility answer (the axe gate runs with zero exclusions), a
desk-only mobile gate, and a full depth pass — none of which fits T-1.

**Alternatives considered:** (1) ship a 3D force graph for reveal day —
rejected, dishonest to the product and ungated; (2) a deterministic, seeded
"constellation" secondary view where positions are still derived from the
record (never from physics at runtime) — deferred to `FEATURES-BACKLOG.md`,
after the Oct 1 reveal; (3) point the molecule idea at the Oct 1 code-graph
system, where a real graph of thousands of nodes is the product and a
constellation rendering is truthful — recorded there as reveal-prep input.
