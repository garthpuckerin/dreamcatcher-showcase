# Issues — dreamcatcher-showcase

> Routing rule (Work Item Routing Standard): this file is the home for anything
> **broken, wrong, missing, or knowingly deferred**. Ideas go to
> `FEATURES-BACKLOG.md`, sequenced commitments to `ROADMAP.md`, decisions with
> rationale to `DECISIONS.md`. Every entry carries evidence (or says it is
> undiagnosed) and says whether it is user-visible.

## Open

- 🟡 **No lint script / eslint config.** Not user-visible. Ported as-is from
  `portofolio-hub/apps/dreamcatcher`, where it's a pre-existing gap shared
  with the other 3 demo apps (2026-07-02 audit finding — only `apps/web` in
  the monorepo has lint wired). Verification here relies on build + e2e +
  the unit/sweep gates, per the same fallback the 2026-08-24 representativeness
  plan used. Deferred; add if/when the monorepo apps get a coordinated
  lint pass.
- 🟡 **No real-time-collaboration surface** — deliberate (see
  `DECISIONS.md` "No RBAC/persona model"), not a defect, but noted here so it
  isn't mistaken for an oversight: production's collaboration layer is
  roadmap, not built, so this demo doesn't depict multi-user editing.
- 🟡 **T-2 reveal-season assets not yet produced** (Sep 15 target, reveal is
  Sep 17): `reveal-meta/dreamcatcher.json`, the teaser asset, a capture run
  from the LIVE deploy once this repo is the Vercel git-integration source,
  and the `project-dreamcatcher.html` case-study rewrite on garthpuckerin.dev
  (currently the pre-reveal teaser/lock guard page only). Not a defect —
  scheduled, tracked here so it isn't lost.
- 🟢 **Monorepo mirror not yet retired.** `portofolio-hub/apps/dreamcatcher`
  is now redundant per the showcase-repo model but is kept per the deferral
  rule until demo↔prod reconciliation is verified (same pattern as every
  prior showcase repo). Its `ORIGIN.md` needs updating to point here as the
  canonical dev home + record the sync procedure, once this repo's `main` is
  pushed.

- 🔴 **Timezone-dependent one-day date shift in `shiftIso()`/`offsetFromAnchor()`
  (`src/field-notebook/dates.js`).** `offsetFromAnchor()` parses its input with
  a bare `new Date('YYYY-MM-DD')`, which JS treats as UTC midnight, while
  `ANCHOR` is built from an explicit `T00:00:00` **local-time** literal. In any
  negative-UTC-offset timezone (reproduced at UTC-4), every bare-date fixture
  literal in `fixtures.js` (there are many) renders one calendar day earlier
  than a time-qualified fixture in the same dream. Silent — no NaN/Invalid
  Date, so the whiteglove text-defect sweep can't catch it. User-visible as an
  internally-inconsistent date within a single dream's timeline. Documented as
  a "KNOWN GAP" case in `tests/anchor-coherence.test.mjs` (proves current
  behavior, does not assert it's correct) rather than silently fixed, since
  fixing app source was out of scope for the gate-porting pass that found it.
  **Also present in `portofolio-hub/apps/dreamcatcher/src/field-notebook/dates.js`**
  (same file, pre-mirror) — fix once, in whichever copy is canonical when this
  is picked up.
- 🟡 **`.kpi-grid` (Analytics KPI row) has no responsive override.** Fixed
  `grid-template-columns: repeat(4, 1fr)` in `theme.css` with nothing narrowing
  it — renders ~72–83px-wide cards at phone widths (360–375px). Found by
  `scripts/viewport-sweep.mjs`. User-visible, phone only.
- 🟡 **`.fn-search` overlaps `.fn-topbar-actions` at two viewport bands**
  (932×430 landscape phone, 1024×768 tablet landscape) — up to 56px of real
  pixel overlap, confirmed by a Playwright click landing on the search pill
  instead of the intended button. The search pill doesn't shrink to make room
  for the action buttons in that width range. Found by
  `scripts/viewport-sweep.mjs`. User-visible.
- 🟡 **New Dream modal doesn't fit short viewports** (375/390/430px-tall
  landscape phones) — `.fn-modal-backdrop` has no `overflow-y` and `.fn-modal`
  uses `overflow: hidden` with no internal scroll body, so a tall form has
  nowhere to go below the fold. Found by `scripts/mobile-sweep.mjs`.
  User-visible, phone landscape only.
- 🟢 **No `@axe-core/playwright` a11y coverage** — `grant-tracker-showcase` has
  it wired into its e2e specs; dreamcatcher's `e2e/` doesn't reference it, so
  it was deliberately not added as an unwired dependency during the gate-suite
  port. Follow-up: wire real a11y assertions, then add the dependency.

## Closed

_(none yet — repo created 2026-09-11)_
