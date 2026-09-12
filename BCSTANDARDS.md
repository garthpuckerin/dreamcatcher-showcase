# BCSTANDARDS — dreamcatcher-showcase

> AI agents: read this before writing code. This is the AI Context Contract for
> this repo. It is written to be safe if this repo is public (it becomes public
> at the reveal) — keep it that way: no other project's embargoed names, no
> secrets, no engine internals, no private absolute paths.

## What this repo is

- A **curated public showcase** of the Dreamcatcher **cockpit** — the frontend
  field-notebook UI, not the engine. Mock fixtures only; no backend, no network,
  no secrets. See `README.md` (§"What's real vs. illustrative") for the exact
  cockpit-vs-engine boundary; the production engine (Postgres persistence, real
  authentication, real-time collaboration, the OpenAI-backed AI-assistant
  pipeline, source-repository sync) is a separate **private** codebase and must
  never be described or referenced here beyond that honest boundary table.
- This repo is the **canonical dev home** for the Dreamcatcher cockpit frontend
  going forward (owner decision, 2026-09-11, per the per-reveal showcase-repo
  model). The monorepo copy at `portofolio-hub/apps/dreamcatcher` is redundant
  but not yet retired (retirement is deferred until demo↔prod reconciliation is
  verified, same deferral rule as every prior showcase repo). Make cockpit
  frontend edits **here**.
- **Do not import framing from the production engine's own README.** That
  README (`D:\BlurredConcepts\dreamcatcher\README.md`) is roadmap/aspirational
  in large part — SaaS pricing tiers, a template marketplace, a mobile app,
  real-time collaboration, ARR projections against unchecked `Q1 2025`
  checkboxes. None of that is built or audited. Ground every claim in this repo
  in what the engine actually does (per the 2026-08-19 portfolio audit: real
  OpenAI wiring across 7 endpoints, 1149 real tests, genuine retro-tracing and
  citation-graph capability) — never in its own marketing copy.

## Governance

- Authority: **Blurred Concepts Engineering Constitution v2.0** —
  `github.com/garthpuckerin/blurred-concepts-engineering`.
- Precedence (Constitution §1): direct owner instruction → this `BCSTANDARDS.md`
  → Constitution → topic standards → supporting docs.
- **Product class (Product Class Standard):** `P` — single-user personal
  workspace, no multi-tenant/regulated/billing surface (no RBAC/persona model,
  unlike Grant Tracker or Ops Command Center — see README's role-visibility
  scope). Confirm or raise, never lower.

## Code Comprehension (Comprehension Ladder Standard)
<!-- bcstd:managed comprehension v1 -->
- Graph repo_id: `github.com/garthpuckerin/dreamcatcher-showcase`
- This repo is **new and not yet ingested** into the code-graph. Until it is,
  raw `Read`/`Grep` are the correct tools here; once ingested, query the ladder
  (`map` / `find` / `explain` / `neighbors` / `read`) with the repo_id above
  before raw reads for structure/behaviour/relationship questions. Note: this
  is a React app — the graph does not model JSX render edges, so grep for
  "what renders X" regardless.
<!-- /bcstd:managed -->

## Git & Release

- **Branch model (alternate, documented per the Git & Release Standard):** this
  repo does not use short-lived `feat/*`/`fix/*` branches. It is solo-maintained
  (owner + AI pair); commits land directly on **`main`**, which is the Vercel
  production branch — **push to `main` auto-deploys** the live demo once the
  git-integrated Vercel project is connected.
- **Verify before pushing:** `npm run lint` (eslint, zero findings),
  `npm run build` (clean), `npm run test:unit` (anchor-coherence +
  fixture-honesty gates), `npm run test:e2e` (fixtures-only smoke with zero
  console/page/network errors, plus the axe-core WCAG 2.x A/AA gate over every
  screen at desktop and phone width — no rule exclusions, fix the surface), and
  `npm run test:sweeps` (whiteglove/mobile/viewport defect sweeps; the mobile
  sweep asserts the derived phone single-column list, offscreen content, a
  sideways-panning canvas, the 32px touch-target floor, and that the tour's
  first step spotlights something rendered) must pass. `npm run test:release`
  runs the full gate. The fabricated-signal grep-gate
  (`grep -rnE '[0-9]{1,3}\s*%[\s-]*(confidence|confident|accuracy|accurate|match|certainty|certain)|confidence:\s*0?\.[0-9]' src`
  → must be 0 hits) is the honesty-specific check ported from the
  2026-08-24 representativeness fix — widened 2026-09-12 after a
  "90%-confident" phrasing on the Today page slipped past the narrower
  original pattern — never weaken it.
- Tags: not adopted here; don't tag unilaterally.

## Publish / spoiler discipline (reveal-season)

- **Private until the reveal.** This repo is created **private** and flips to
  **public at the Dreamcatcher reveal (Thu Sep 17 2026, 16:00 UTC)** —
  owner-only action: `gh repo edit garthpuckerin/dreamcatcher-showcase
  --visibility public --accept-visibility-change-consequences`.
- **noindex is kept** at reveal (house policy): the deployed demo carries
  `<meta name="robots" content="noindex">`; SEO/GEO lives on the hub
  (`garthpuckerin.com`), which links to this demo. Do not remove the noindex
  tag.
- **"The net" is a teaser codename, not the public title.** The reveal-day
  case study and `reveal-meta/dreamcatcher.json` use the real product name;
  "The net" only appears in the pre-reveal teaser copy on garthpuckerin.dev.
- **Sanitized-only.** Never add engine internals, secrets, real PII, or any
  other reveal-season project's embargoed name/content. Vercel serves only
  `dist/`, so repo-root docs are not served by the live site — but this repo is
  public after the reveal, so treat every committed file as public.

## Institutional Memory
<!-- bcstd:managed memory v1 -->
- The comprehension and memory habits are active client bindings, not passive
  repository guidance. Each client must use the highest enforcement tier it
  supports under the Comprehension Ladder Standard.
- Recall Ogham with `hybrid_search` when starting work on a system that may
  have prior context. Before ending, store decisions with rationale, gotchas,
  and cross-session operational context with source, controlled tags, and a
  deliberate TTL. Never store secrets or code-structure facts.
- Canonical memory policy: `standards/Memory_Standard.md` in
  blurred-concepts-engineering — it governs on any conflict.
<!-- /bcstd:managed -->
