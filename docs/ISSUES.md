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
  prior showcase repo). `ORIGIN.md` updated 2026-09-11 to point here as the
  canonical dev home. **Now also carries drift**: the 2026-09-12 fixes below
  (dates.js, theme.css topbar/kpi-grid/modal, Today.jsx) exist only in this
  repo — sync them into the monorepo copy next time it's touched.
- 🟢 **No `@axe-core/playwright` a11y coverage** — `grant-tracker-showcase` has
  it wired into its e2e specs; dreamcatcher's `e2e/` doesn't reference it, so
  it was deliberately not added as an unwired dependency during the gate-suite
  port. Follow-up: wire real a11y assertions, then add the dependency.

## Closed

- ✅ **Vercel git integration re-pointed** (2026-09-12). `garthpuckerin-dreamcatcher`
  now deploys from this repo's `main` (`vercel git connect`, owner-authenticated);
  live URL byte-verified against the local build.
- ✅ **Timezone-dependent one-day date shift in `shiftIso()`/`offsetFromAnchor()`**
  (2026-09-12). Root cause: `offsetFromAnchor()` parsed its input with a bare
  `new Date('YYYY-MM-DD')` (UTC midnight per spec) while `ANCHOR` used an
  explicit `T00:00:00` **local-time** literal — a mismatch that silently
  shifted every bare-date fixture one day earlier in negative-UTC-offset
  zones. Fixed with a `parseLocal()` helper that normalizes both bare-date and
  time-qualified literals to local-time parsing before either is used; the
  `tests/anchor-coherence.test.mjs` case that documented the bug as a "KNOWN
  GAP" now asserts the fix as a regression test instead. **Still present in
  `portofolio-hub/apps/dreamcatcher/src/field-notebook/dates.js`** (pre-mirror
  copy) — carry the fix over on next sync.
- ✅ **`.kpi-grid` no responsive override** (2026-09-12). Added a
  `repeat(2, minmax(0,1fr))` override at the existing `≤640px` breakpoint,
  matching the mobile-sweep's phone column budget. Verified 2-column layout
  at 375px in-browser and via a clean `viewport-sweep`/`mobile-sweep` run.
- ✅ **`.fn-search` overlaps `.fn-topbar-actions`** (2026-09-12). Root cause:
  `.fn-topbar`'s middle grid track had a hard `minmax(320px, 480px)` floor
  that couldn't shrink even when the crumb + actions columns needed the room.
  Changed to `minmax(0, 480px)`. Verified via `getBoundingClientRect()` at
  both flagged widths (1024×768: overlap 7.6px → gap 54px; 932×430: overlap
  confirmed → gap 30px) and unchanged at 1440px (search still gets its full
  480px). This also **surfaced a second, previously-undetected real defect**:
  `.fn-topbar` never actually left `display: grid` at the `≤900px`
  breakpoint, so the `flex-wrap`/`order`/`flex-basis` rules meant to wrap it
  into a mobile layout were dead code — the topbar was rendering as an
  evenly-divided 3-column grid at phone widths the whole time (caught by
  `mobile-sweep.mjs`'s over-columned-grid check once the 320px floor no
  longer masked it). Fixed by adding `display: flex` to the `≤900px` rule so
  the existing wrap rules actually apply. Full `test:release` gate (build +
  unit + e2e + all 3 sweeps) green after both fixes.
- ✅ **New Dream / New Fragment modal doesn't fit short viewports**
  (2026-09-12). `.fn-modal-backdrop` gained `overflow-y: auto`; `.fn-modal`
  became a flex column with `max-height: min(80vh, 640px)` and its own
  `overflow-y: auto`; `.fn-modal-head`/`.fn-modal-actions` made
  `position: sticky` (top/bottom respectively) so the header and action
  buttons stay pinned while only the field list scrolls. Pure CSS — no JSX
  changes, so it fixes both modals that share these classes (New Dream, New
  Fragment) at once. Verified in-browser at 844×390: header/footer pinned,
  Brand/Status/Tags fields reachable by scrolling.
- ✅ **Incidental honesty-gate leak found while verifying the above**
  (2026-09-12): the Today page's AI Assistant Pulse card read "three are
  90%-confident matches for existing dreams" — a fabricated confidence number
  the 2026-08-24 representativeness grep-gate's regex didn't catch because it
  matched on "confidence" but not the "confident" wordform. Reworded to
  "three pattern-match existing dreams, cited in Suggestions" (consistent
  with the Suggestions view's citation-based framing). Widened the documented
  grep-gate pattern in `README.md`/`BCSTANDARDS.md`/`docs/architecture.md` to
  also catch `confident`/`accurate`/`certain` wordforms.
- ✅ **Hardcoded port 3100 collided with an unrelated local service**
  (2026-09-12, found while verifying the fixes above — `localhost:3100` was
  redirecting to `/profiles`, not this app). Moved `vite.config.js`'s default
  dev port, `playwright.config.js`'s `baseURL`/`webServer.url`, and
  `scripts/capture-dreamcatcher-preview.mjs`'s default `PREVIEW_URL` to 3177.
  `scripts/run-release-sweeps.mjs` already used its own dedicated port (3310)
  and was unaffected.
