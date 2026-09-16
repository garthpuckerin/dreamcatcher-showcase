# Issues — dreamcatcher-showcase

> Routing rule (Work Item Routing Standard): this file is the home for anything
> **broken, wrong, missing, or knowingly deferred**. Ideas go to
> `FEATURES-BACKLOG.md`, sequenced commitments to `ROADMAP.md`, decisions with
> rationale to `DECISIONS.md`. Every entry carries evidence (or says it is
> undiagnosed) and says whether it is user-visible.

## Open

- 🟡 **No real-time-collaboration surface** — deliberate (see
  `DECISIONS.md` "No RBAC/persona model"), not a defect, but noted here so it
  isn't mistaken for an oversight: production's collaboration layer is
  roadmap, not built, so this demo doesn't depict multi-user editing.
- ✅ (moved to Closed) T-2 reveal-season assets — produced 2026-09-16 on the
  site side: reveal-meta, imagery from the live deploy, teaser staged, case
  study rewritten (see garthpuckerin.dev CHANGELOG 2.18.0).
- 🟢 **Monorepo mirror not yet retired.** `portofolio-hub/apps/dreamcatcher`
  is now redundant per the showcase-repo model but is kept per the deferral
  rule until demo↔prod reconciliation is verified (same pattern as every
  prior showcase repo). `ORIGIN.md` updated 2026-09-11 to point here as the
  canonical dev home. Synced 2026-09-12 (evening) with every fix in the
  Closed log below.
- 🟡 **Safe-area / viewport-fit fixes are verified by no-regression only.**
  Latent until an owner looks on a home-indicator iPhone:
  `env(safe-area-inset-*)` resolves to 0 in every headless/emulated browser,
  so the `viewport-fit=cover` + `100dvh` treatment (closed below) has never
  been seen on a real device for this demo. Owner action; nothing to fix
  until it is looked at.

## Closed

- ✅ **Revisions stopped short of the workflow it sells** (2026-09-16, T-1
  review: "does the demo truly flex what Dreamcatcher can do?"). Ratify showed
  "no workspace data changed"; production applies the split. Now ratify
  APPLIES it to the local workspace (four dreams created from a new
  conflated origin backlog fixture, fragments partitioned by artifact, origin
  archived with the reason, Graph edges added from the proposal's quoted
  links) and revert restores it byte-for-byte; the decision persists and
  restoring the origin from Archive is the same revert. Also caught by the
  same pass: the rail/Settings plan usage was a load-time constant that
  drifted once dreams were created — now derived live. Gates:
  `tests/revision-apply.test.mjs` (round trip, idempotence, graph
  derivation); whiteglove resets the decision per screen. Full gate green.
- ✅ **Checklist walk (2026-09-12, evening) — the polish standard walked end
  to end, not a rescan.** Everything below was invisible to the mobile/a11y
  rescan and fell out of walking `DEMO_POLISH_CHECKLIST.md` §0–§8 item by
  item with greps and reads:
  - **Hand-typed figures beside derived ones (§0b/§1):** Rail badges
    `4 / 12 / 4` while the Inbox page and tab bar derived 6; Rail presence
    "3" and "PRO · 24/100" while Settings derived 12/100; Today deltas
    ("+ 14 this week", "+ 4 today", "2 online now") and a "17 days / best
    32d" streak; Analytics "Dream velocity 4.2", "9.7", "71%" and every
    delta; the Insights list; the AI Assistant's Insights tab; the Today
    assistant quote ("three pattern-match", "4s ago"). All derive now from
    `src/field-notebook/insights.js`. The activity heatmap's synthetic
    84-day pattern was itself a second dataset (a 17-day streak beside
    "+0 fragments this week"); the series now builds from the real dated
    records (fragments, done todos, versions, documents, retros, inbox,
    archive, decided suggestions — one event log). `SUGGESTION_LOG` was
    added to the fixtures so "AI accepts" is a rate over recorded decisions.
    Gate: `tests/view-honesty.test.mjs`.
  - **Today badge ≠ Today list:** the badge counted todos due within 7 days
    (5) while the list showed the 6 nearest regardless. One
    `priorityTodos()` feeds both.
  - **Landing gate in localStorage** (`fn:session:v1`) — the exact 08-20
    reveal-day class: a returning visitor skipped the auth/landing screen.
    Now `sessionStorage`; every sweep/spec/capture script updated.
  - **Sign-out did not clear the onboarding flag**, so landing → tour → app
    could not be replayed. Fixed.
  - **No `?view=desktop` escape hatch** — added (`useIsMobile` honors it),
    linked from the desk-only screen.
  - **AI Suggestions had no re-run** (dismissal is triage, not resolution):
    "Re-run matcher" re-derives and re-raises.
  - **Archive and Templates had no empty state** for a filter with no
    matches. Added.
  - **The demo's own index.html had no OG card**: og:title/description/url/
    image + twitter:card + theme-color, `public/og.png` captured from the
    build by `scripts/capture-og.mjs` (serves `dist/` itself). Title lost
    its emoji.
  - **"Demo placeholder"** status label (apologetic-copy grep) → "Not stored
    in this preview".
  - **No visible keyboard focus** on controls that set `outline: none` —
    global `:focus-visible` ring added.
  Verified: lint clean, unit 8/8, e2e 41/41, sweeps clean (the new sweep
  caught the desk-only escape link at 16px tall on its first run — fixed).
  Demo-driven deltas filed in the engine's `docs/ROADMAP.md`; the polish
  checklist (§0b, §4, §4b, §6, §7, §10) and the reveal-cycle skill carry the
  generic rules.
- ✅ **Companion surfaces still carried desktop multi-column grids; several
  screens rendered content past the right edge of a phone** (2026-09-12,
  full rescan after the owner's "fix mobile and anything else" direction).
  The second mobile pass had fixed the grids it *saw*; this pass derived the
  whole list instead: a static walk over every multi-column
  `grid-template-columns` in `theme.css` cross-referenced against the
  ≤900/≤640 blocks (55 base grids, 36 with no phone override), then a
  runtime walk over every route, Settings section, list/cards state and
  overlay at 375/768/1024 measuring offscreen content, clipped text, rendered
  grid tracks and touch targets. Real defects found and fixed, all in the
  new "Companion-surface completion" block of `theme.css` (each rule names
  the base declaration it overrides):
  - **Settings** (`.settings` 220px+1fr): the sidebar nav stayed beside the
    content at 375px and pushed the whole section ~300px off-screen;
    `.settings-row` (1fr 260px) left ~80px for the label. Now single-column;
    the section nav is a native `<select>` on phones (`.settings-jump`, see
    `DECISIONS.md`), rows stack, controls go full-width; the GitHub
    connection card, integration mini-cards and plan card stack too.
  - **Integrations** (`.integration-row` 40px 1fr 100px 160px): copy got
    ~50px and the Connect/Manage buttons rendered past the viewport edge.
    Logo + copy on one row, tier and actions beneath.
  - **Archive list view** (`.fn-archive-row`, 872px minimum, and
    `.fn-archive-toolbar`): phones default to cards, but the list toggle is
    still offered and produced a page four times wider than the screen. Rows
    are now cards below 900px; toolbar stacks.
  - **Dream detail header** (`.fn-detail-head`): the avatar stack, AI button
    and five state controls sat in a column to the right of a 46px title,
    340px past the edge on every dream page (and behind every overlay opened
    from one). Stacks; state controls wrap; collaborator rows drop the fixed
    100px role track.
  - **Page headers** (`.page-head-2`): the trailing chip row (Templates) and
    action button (Portfolio "+ New case study") were squeezed into a ~40px
    column beside the lead copy. Stack below 900px.
  - **Inbox header buttons rendered as two blank squares**: the Inbox page
    header reuses the `.fn-topbar-actions` class, and the ≤640px topbar rule
    that turns the shell's action buttons icon-only (`font-size: 0`) was
    unscoped, so it also erased the labels of "Capture from AI chat" and
    "Auto-file all" (text glyphs, no svg to keep). Rule scoped to
    `.fn-topbar > .fn-topbar-actions`.
  - **Analytics donut** legend got 97px; stacks.
  - **Touch targets**: switches 36×20, sort selects 23px, chips 28px, auth
    tabs 30px, inline link-buttons 17–28px. 40px floor for controls, 36px
    for inline link-buttons, switch keeps its visual and gains a 44px hit
    area via `::before`. Topbar icon-only buttons are 40px squares.
  - **`#root` was `width: 100vw` / `height: 100vh` only** (`index.css`):
    100vw includes the desktop scrollbar gutter, and this file was missed by
    the earlier `100dvh` pass. Now `100%` and `100vh` + `100dvh`. Body
    background switched from a navy `#0f172a` to the paper token so iOS
    overscroll never exposes a dark strip behind the light app.
  Verified: runtime audit re-run reports zero offscreen/clipped elements
  and zero sideways-panning canvases on every screen and overlay at
  375×812, 768×1024 and 1024×768; full release gate green. The derivation
  is kept as tests: `scripts/mobile-sweep.mjs` now asserts the phone
  single-column list (`PHONE_SINGLE_COLUMN`), stacked flex rows, a
  sideways-panning canvas, any element past the viewport edge, the 32px
  touch-target floor, the Inbox header buttons, every Settings section,
  and both list views.
- ✅ **Onboarding tour spotlighted a hidden element on phones** (2026-09-12).
  Step 1 targeted the rail (`display:none` ≤900px) and step 6 the
  dream-detail "On this page" rail (hidden ≤1024px), so a phone visitor got
  a tour card at the top-left with no spotlight and copy about a rail that
  does not exist. The tour now derives its steps from the shell it finds
  (`buildTourSteps()` in `DemoOverlays.jsx`): bottom tab bar + "More" sheet
  copy on phones, Settings' section picker instead of the sidebar nav, the
  detail-rail step dropped below 1024px, and a zero-size target skips
  forward instead of spotlighting nothing. `mobile-sweep.mjs` asserts the
  first step's spotlight is on a rendered element at every phone viewport.
- ✅ **No lint** (2026-09-12). `eslint.config.js` (flat: `@eslint/js`
  recommended + `eslint-plugin-react` + `eslint-plugin-react-hooks`,
  browser+node globals). First run: 12 errors (unused `catch (e)` bindings
  in every sweep script, an unused `React` import, an unused `useMemo`) and
  one real hook-deps warning in `DemoChatReplay.jsx` (`messages` rebuilt
  every render, feeding a `useEffect`) — all fixed. `npm run lint` is now
  the first step of `test:release`.
- ✅ **No a11y gate** (2026-09-12). `e2e/accessibility.spec.js` runs axe-core
  (WCAG 2.0/2.1/2.2 A+AA tags) over 15 screens plus the auth screen, AI
  Assistant, New Dream modal and the tour, at 1440×900 and 375×812 — 38
  checks, no rule exclusions. First run failed 38/38; every finding was a
  real defect and was fixed at the source: the `--muted` text token sat at
  4.37:1 on the page background (paper/slate 0.55→0.52 L, ink 0.58→0.66; a
  small oklch→sRGB contrast calculator was used to pick values that clear
  4.5:1 on bg, surface and surface-2 per theme); `--good` 0.55→0.50 and
  `--warn` 0.62→0.54; badge and avatar text on tinted backgrounds mixed
  toward black; the auth demo-notice violet `#a78bfa` (2.24:1) → `#4c35b5`;
  Brand/Sort selects, the Archive sort select and every Settings input/select
  had no accessible name (`SettingsRow` now passes its title as the control's
  `aria-label`); the All Dreams stats `<dl>` held plain `<div>` children;
  the graph `<svg role="img">` contained focusable edge buttons
  (`role="group"`); the main canvas scroll region was not keyboard-focusable
  (`tabIndex=0`).
- ✅ **Release gate blocked by a leaked preview server on port 3310**
  (2026-09-12). `scripts/run-release-sweeps.mjs` used `strictPort: true`; a
  `node scripts/run-release-sweeps.mjs` process from an interrupted earlier
  run had held 3310 since 01:41 and every sweep run since printed "Port 3310
  is already in use" and exited 1. The runner now falls back to the next
  free loopback port (still passing its own URL as `BASE_URL`, so the
  "local candidate only" rule from the 2026-09-03 decision holds) and closes
  its server on SIGINT/SIGTERM. The stale process itself is an owner action
  (this session's process kill was blocked by the tool sandbox).

- ✅ **Mobile rebuild missed several view-level desktop grids, plus a
  vanishing topbar button** (2026-09-12, owner-caught after the mobile
  companion shipped — "mobile view is still inappropriate for mobile").
  The bottom-tab shell and DESK_ONLY_VIEWS routing were real, but three
  page-level grids never got a mobile override and were never audited:
  `.today-grid` (the Today page's Priorities/Pulse two-column layout —
  the FIRST screen after sign-in), `.today-stat-grid`, `.analytics-row`/
  `.analytics-row.analytics-even`, and `.velocity-row` (found by a second
  sweep run after the first three were fixed) — all stacked to one column
  at ≤900px. Also: the topbar's "Assistant" button rendered as an empty
  white square on phone — its label was a literal `"* Assistant"` text
  string, and the existing `≤640px .fn-topbar-actions .fn-btn { font-size:
  0 }` treatment (meant to hide button labels and keep icons) hid the
  literal asterisk along with the word, leaving nothing visible. Replaced
  with a real `<Sparkles>` icon (lucide-react) matching the New Dream
  button's icon+text pattern. Verified in-browser at 375×812: Priorities
  list and Pulse cards render full-width with no wrapping/overlap, the
  Assistant button shows its icon. Full `test:release` gate green
  (including a second sweep run after the `.velocity-row` fix, since the
  first `.today-grid` fix alone left that one still failing).
- ✅ **Missing `viewport-fit=cover` / `100dvh` safe-area handling** (2026-09-12,
  applied from a prior reveal-season gotcha — GT/Ops both hit a "white strip
  along the bottom" on home-indicator iPhones from this exact cause and it was
  logged as reusable across every future demo including dreamcatcher, but
  wasn't applied here until checked today). Added `viewport-fit=cover` to
  `index.html`'s viewport meta; added a `100dvh` fallback line after every
  full-viewport `100vh`/`min-height:100vh` in `theme.css` (`.fn-shell`,
  `.auth-screen`, `.auth-art`, `.auth-form-wrap`). Cannot be verified
  headless (`env(safe-area-inset-*)` resolves to 0 in emulators per the prior
  finding) — real test is on-device. Sweeps re-run clean as a no-regression
  check (mobile 5/5, viewport 15/15, e2e 3/3).
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
- ✅ **Mobile ≤900px was a desktop UI squeezed into a phone viewport, not a
  real mobile surface** (2026-09-12, owner-caught). The rail collapsed into a
  horizontally-scrolling pill strip at the top of the page and every canvas
  view was the same desktop grid/row layout narrowed to one column. Rebuilt
  as a genuine mobile-native companion shell, porting the pattern already
  proven in `grant-tracker-showcase` (`mobile-tabs.jsx` bottom tab bar +
  `cardify.js` card-lists) and `ops-command-center-showcase`
  (`DESK_ONLY_VIEWS` surface-scoped mobile authority), adapted to
  Dreamcatcher's route shape and its dream-card/fragment content model
  (there are no `<table>`s to cardify here, so the card treatment is
  content-specific per view — see below). Shipped:
  - `src/field-notebook/MobileNav.jsx` — `.fn-mtab` bottom tab bar (Today /
    All Dreams / Inbox / More) plus a `.fn-more-sheet` nav drawer for every
    other destination, with desk-only routes marked "desk" (not hidden).
  - `src/field-notebook/deskOnly.js` — `DESK_ONLY_VIEWS` keyed by
    `route.kind`, checked against deep links (a restored/saved route), not
    just nav clicks, so a phone visitor can't reach the authoring UI by URL.
  - `.fn-rail` is now `display:none` below 900px (no more horizontal-strip
    collapse) and `.fn-shell`'s grid drops back to a single row now that the
    rail doesn't occupy one.
  - All Dreams and Archive default to their existing `cards` view (not
    `list`) below 900px — reusing the already-built `DreamCard`/`ArchiveCard`
    components rather than inventing new markup. Archive/Portfolio's
    `.fn-showcase-grid` (previously a fixed 3-column grid with no phone
    override at all) gets a single-column override.
  - Inbox rows become bordered, labeled cards via CSS at ≤900px (`Source ·`
    / `Suggested ·` labels via `::before`, full-width action row) — no
    `<table>`, so `cardify.js`'s `data-label`-from-`<thead>` mechanism
    doesn't apply directly; this is the Dreamcatcher-specific adaptation the
    task called for.
  - Desk-only calls: Builder Notes (long-form authoring + a proof matrix
    meant for side-by-side comparison), Case Study Composer (arranging
    sections/media/narrative is composition, not triage), and Graph (the
    core interaction is clicking one specific edge among several packed
    close together on a wide timeline — needs a precise pointer and screen
    width). Revisions (a single ratify/reject decision after reading a card
    of text) and Settings (rows of toggles/selects) stay on the phone as
    companion surfaces — see `docs/DECISIONS.md` for the full rationale.
  - `scripts/mobile-sweep.mjs` and `scripts/viewport-sweep.mjs` updated: the
    old "no dedicated mobile shell" honesty note is now stale and rewritten;
    `.fn-mtab` allow-listed in the grid-column check (nav chrome, not a
    squeezed content grid); the Rail check now asserts `display:none` below
    900px (not just "not too tall"), and a new check asserts `.fn-mtab`
    renders below 900px and stays hidden above it — a real assertion of the
    new behavior, not just the old bug's absence.
  - Full `test:release` gate (build + unit + e2e + all 3 sweeps) green.
  Manually verified via a scripted Playwright pass at 375×812 and 844×390:
  bottom tabs render and navigate, the Graph desk-only screen shows its
  honest rationale copy, and Inbox/All Dreams/Archive render as real cards.
