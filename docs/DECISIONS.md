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
