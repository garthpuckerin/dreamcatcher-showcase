/* Mobile/tablet white-glove sweep — the defect classes the viewport sweep
 * measures at the pixel level but doesn't walk every screen for: nested
 * scroll regions, over-columned grids, and sideways scroll.
 *
 * Below 900px Dreamcatcher now has a real mobile-native companion shell:
 * `.fn-rail` is `display:none` (the vertical nav strip does not exist on
 * phones at all, collapsed or otherwise) and `.fn-mtab` — a fixed 4-item
 * bottom tab bar (Today / All Dreams / Inbox / More) — is the primary phone
 * nav instead. "More" opens a full-screen nav sheet listing every other
 * destination, including the DESK_ONLY_VIEWS routes (Builder Notes, Case
 * Study Composer, Graph) marked with a "desk" tag rather than hidden; those
 * three render a designed "stays at the desk" screen instead of their
 * authoring UI when visited on a phone viewport (see src/field-notebook/
 * deskOnly.js). Revisions and Settings stay reachable and fully usable on
 * the phone.
 *
 *  1. Nested scroll regions on phones — anything that scrolls inside the
 *     page besides the one legitimate scroll surface (`.fn-main-scroll` /
 *     `.fn-scroll`), a drawer/modal/dialog/nav-sheet.
 *  2. Grids that stay multi-column at widths where they can't afford to.
 *     `.fn-mtab` is allow-listed: a fixed-width bottom tab bar is nav
 *     chrome, not a content grid squeezed narrow — narrow, equal-width
 *     tab columns are the intended shape at every phone width.
 *  3. Sideways scroll (the page never pans).
 *
 *   BASE_URL=https://… node scripts/mobile-sweep.mjs   (defaults to live)
 */
import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://garthpuckerin-dreamcatcher.vercel.app'

const VIEWPORTS = [
  ['phone-P', 375, 812, 'phone'],
  ['phone-P small', 360, 800, 'phone'],
  ['phone-L', 844, 390, 'phone-land'],
  ['tablet-P', 768, 1024, 'tablet'],
  ['tablet-L', 1024, 768, 'tablet'],
]

// Grid column budget per tier: more columns than this at this width is a
// finding unless the container is explicitly allowed below.
const MAX_COLS = { phone: 2, 'phone-land': 3, tablet: 4 }

// Containers allowed to keep columns at small widths. Auto-fill card grids
// (grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))) already
// self-collapse to one column below their minmax floor, so they never need
// listing here. This list is for containers verified by reading their CSS
// (not guessed at from the sweep output) to be one of:
//   - row-shaped, not card-shaped: `fn-todo` (22px 1fr auto auto) and
//     `fn-collab-row` (32px minmax(0,1fr) 100px auto) both carry a genuinely
//     flexible name/title track; the sweep's maxTrack<120 proxy (measuring
//     RENDERED pixels, since getComputedStyle never reports the "fr" unit
//     itself) can misfire at the single narrowest tested width (360px)
//     where every track happens to compute under 120px at once.
//   - deliberately dense by design: `heatmap` is an 84-cell (12x7) activity
//     heatmap, the same category as a GitHub contribution graph — small
//     cells at every viewport is the intended look, not a squeeze defect.
const GRID_ALLOW = ['fn-stats', 'fn-field-grid', 'settings-control-group', 'graph-legend', 'fn-todo', 'fn-collab-row', 'heatmap', 'fn-mtab']

// Elements with their own deliberate horizontal scroll, verified by reading
// their CSS: `.builder-matrix` is a dense feature-comparison table given
// `overflow-x: auto` (with `.builder-matrix-row { min-width: 920px }`)
// specifically so it scrolls sideways rather than illegibly compressing —
// unlike an accidental nested-scroll region, this is the documented pattern
// for a table too wide to reflow, applied at every tier including phone.
// `.graph-canvas-wrap` is the Graph's timeline canvas: `overflow-x: auto` by
// design, so a wide time axis scrolls sideways inside its card (it is desk-only
// below 900px; this matters at the 1024px tablet-landscape tier).
const SANCTIONED_XSCROLL = ['builder-matrix', 'graph-canvas-wrap']

// Derived 2026-09-12 (static audit of every multi-column grid in theme.css
// against the phone breakpoints): companion-surface containers that must be
// single-column on a phone. Add to this list when a new desktop grid gets a
// phone override; the sweep then proves the override actually applies.
const PHONE_SINGLE_COLUMN = [
  '.settings',
  '.settings-row',
  '.settings-card-grid',
  '.plan-card',
  '.integration-row',
  '.fn-archive-toolbar',
  '.fn-archive-row',
  '.today-grid',
  '.today-stat-grid',
  '.analytics-row',
  '.velocity-row',
  '.donut-row',
  '.fn-showcase-grid',
  '.inbox-row',
]
// Flex rows that must stack on a phone.
const PHONE_STACKED_FLEX = ['.page-head-2', '.fn-detail-head']

const browser = await chromium.launch()
const issues = []
const note = (vp, screen, what) => issues.push(`${vp} · ${screen}: ${what}`)

for (const [vpName, width, height, tier] of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    isMobile: tier !== 'tablet',
    hasTouch: true,
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('fn:session:v1', 'active')
      window.localStorage.setItem('fn:onboarding:v1', 'done')
    } catch {
      /* no-op */
    }
  })

  const settle = async () => {
    await page.waitForSelector('.fn-shell', { timeout: 10000 })
    await page
      .waitForFunction(() => !document.body.innerText.includes('Loading Builder Notes'), { timeout: 10000 })
      .catch(() => {})
    await page.waitForTimeout(250)
  }

  const scan = async screen => {
    const r = await page.evaluate(
      ({ tier, maxCols, allow, sanctionedXScroll, singleColumn, stackedFlex }) => {
        const out = []
        const vis = el => {
          const b = el.getBoundingClientRect()
          if (b.width < 2 || b.height < 2) return false
          const cs = getComputedStyle(el)
          return cs.display !== 'none' && cs.visibility !== 'hidden'
        }
        const label = el =>
          `${el.tagName.toLowerCase()}${
            el.className && typeof el.className === 'string'
              ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
              : ''
          }`

        // 3. Sideways scroll.
        if (document.documentElement.scrollWidth > innerWidth + 1) {
          out.push(`page pans sideways (${document.documentElement.scrollWidth} > ${innerWidth})`)
        }

        // 1. Nested scroll regions. The app's legitimate scroll surfaces are
        // `.fn-scroll` descendants (the main canvas, dialog bodies) and the
        // Rail's own horizontally-scrolling nav strip below 900px — anything
        // else that actually overflows is a finding.
        for (const el of document.querySelectorAll('*')) {
          if (!vis(el)) continue
          const cs = getComputedStyle(el)
          const scrollsX = /(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 2
          const scrollsY = /(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2
          const isMainScroll = el.classList.contains('fn-scroll') || el === document.documentElement || el === document.body
          const isDialog = el.closest('[role="dialog"]')
          const isRailNav = el.closest('.fn-rail nav') || el.classList.contains('fn-rail')
          const isSanctionedXScroll = sanctionedXScroll.some(c => el.classList.contains(c))
          if (isMainScroll || isDialog || isRailNav) continue
          if (scrollsX && isSanctionedXScroll) continue
          if (scrollsX) out.push(`x-scroll region on a phone tier: ${label(el)} (${el.scrollWidth}>${el.clientWidth})`)
          if (scrollsY) out.push(`nested y-scroll region: ${label(el)} (${el.scrollHeight}>${el.clientHeight})`)
        }

        // 2. Multi-column grids beyond the tier's budget.
        for (const el of document.querySelectorAll('*')) {
          if (!vis(el)) continue
          const cs = getComputedStyle(el)
          if (cs.display !== 'grid') continue
          if (allow.some(c => el.classList.contains(c))) continue
          const tracks = cs.gridTemplateColumns.split(' ').map(parseFloat).filter(w => w > 24)
          const cols = tracks.length
          const maxTrack = Math.max(0, ...tracks)
          const per = el.getBoundingClientRect().width / (cols || 1)
          if (cols > maxCols && maxTrack < 120) out.push(`${cols}-column grid at ${Math.round(per)}px/col: ${label(el)}`)
        }

        // 4. The canvas itself pans sideways. `.fn-main-scroll` is
        // overflow:auto, so a too-wide child never shows up as page-level
        // sideways scroll (check 3) — it shows up as a canvas that can be
        // dragged left, which is how the 2026-09-12 Settings / Integrations /
        // Archive / dream-detail overflows hid from the earlier sweeps.
        const canvas = document.querySelector('.fn-main-scroll')
        if (canvas && canvas.scrollWidth > canvas.clientWidth + 1) {
          out.push(`canvas pans sideways (${canvas.scrollWidth} > ${canvas.clientWidth})`)
        }

        // 5. Anything rendered past the right edge of the viewport. Outermost
        // offender only, sanctioned x-scroll containers excluded.
        const offenders = []
        for (const el of document.querySelectorAll('body *')) {
          if (!vis(el)) continue
          const cs = getComputedStyle(el)
          if (cs.position === 'fixed') continue
          if (sanctionedXScroll.some(c => el.closest('.' + c))) continue
          const b = el.getBoundingClientRect()
          if (b.right <= innerWidth + 1 && b.left >= -1) continue
          if (offenders.some(o => o.contains(el))) continue
          offenders.push(el)
        }
        for (const el of offenders.slice(0, 6)) {
          const b = el.getBoundingClientRect()
          out.push(`renders past the viewport edge (right=${Math.round(b.right)} of ${innerWidth}): ${label(el)}`)
        }

        // 6. Phone tier: the derived single-column list. These are the
        // companion-surface containers whose desktop multi-column grid was
        // found (statically, from theme.css) to have no phone override on
        // 2026-09-12; theme.css now stacks each one, and this asserts the
        // outcome rather than trusting the stylesheet.
        if (tier === 'phone') {
          for (const sel of singleColumn) {
            for (const el of document.querySelectorAll(sel)) {
              if (!vis(el)) continue
              const cs = getComputedStyle(el)
              if (cs.display !== 'grid') continue
              const tracks = cs.gridTemplateColumns.split(' ').map(parseFloat).filter(w => w > 0)
              // An icon/index gutter (≤56px) plus one flexible track is a row
              // shape, not a squeezed content grid — that is the intended
              // phone layout for .integration-row (40px logo + copy).
              const gutterRow = tracks.length === 2 && tracks[0] <= 56
              if (tracks.length > 1 && !gutterRow) out.push(`${sel} is still ${tracks.length}-column on a phone (${tracks.map(Math.round).join('|')})`)
              break
            }
          }
          for (const sel of stackedFlex) {
            const el = document.querySelector(sel)
            if (el && vis(el) && getComputedStyle(el).flexDirection !== 'column') out.push(`${sel} has not stacked to a column on a phone`)
          }

          // 7. Phone tier: touch-target floor. Switches are excluded — their
          // 20px visual keeps a 44px hit area via ::before, which a bounding
          // box cannot see.
          const small = []
          for (const el of document.querySelectorAll('button, a[href], select, input:not([type=hidden]), textarea, [role="tab"]')) {
            if (!vis(el) || el.getAttribute('role') === 'switch') continue
            const b = el.getBoundingClientRect()
            if (b.height < 32) small.push(`${label(el)} ${Math.round(b.width)}×${Math.round(b.height)}`)
          }
          for (const s of small.slice(0, 6)) out.push(`touch target under 32px: ${s}`)
        }

        return out
      },
      {
        tier,
        maxCols: MAX_COLS[tier],
        allow: GRID_ALLOW,
        sanctionedXScroll: SANCTIONED_XSCROLL,
        singleColumn: PHONE_SINGLE_COLUMN,
        stackedFlex: PHONE_STACKED_FLEX,
      }
    )
    for (const w of [...new Set(r)]) note(vpName, screen, w)
  }

  const go = async route => {
    await page.addInitScript(r => {
      try {
        window.localStorage.setItem('fn:route:v1', JSON.stringify(r))
      } catch {
        /* no-op */
      }
    }, route)
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
    await settle()
  }

  const SCREENS = [
    ['today', { kind: 'today' }],
    ['all-dreams', { kind: 'all' }],
    ['inbox', { kind: 'inbox' }],
    ['suggest', { kind: 'suggest' }],
    ['archive', { kind: 'archive' }],
    ['builder', { kind: 'builder' }],
    ['analytics', { kind: 'analytics' }],
    ['portfolio', { kind: 'portfolio' }],
    ['templates', { kind: 'templates' }],
    ['integrations', { kind: 'integrations' }],
    ['revisions', { kind: 'revisions' }],
    ['graph', { kind: 'graph' }],
    ['settings', { kind: 'settings' }],
    ['dream:1', { kind: 'dream', id: 1 }],
    ['dream:7', { kind: 'dream', id: 7 }],
    ['case:7', { kind: 'case', id: 7 }],
  ]
  for (const [name, route] of SCREENS) {
    await go(route)
    await scan(name)
  }

  // Every Settings section (div-swapped, not route-gated) — each carries its
  // own set of .settings-row controls.
  await go({ kind: 'settings' })
  const sections = await page.evaluate(() =>
    [...document.querySelectorAll('#settings-section-picker option')].map(o => o.value)
  )
  for (const id of sections) {
    await page.evaluate(v => {
      const picker = document.querySelector('#settings-section-picker')
      const nav = [...document.querySelectorAll('.settings-nav button')]
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
      if (picker && getComputedStyle(picker).display !== 'none') {
        setter.call(picker, v)
        picker.dispatchEvent(new Event('change', { bubbles: true }))
      } else {
        const idx = [...document.querySelectorAll('#settings-section-picker option')].findIndex(o => o.value === v)
        nav[idx]?.click()
      }
    }, id)
    await page.waitForTimeout(150)
    await scan(`settings:${id}`)
  }

  // All Dreams and Archive in LIST view — phones default to cards, but the
  // segmented control still offers the list, so the row layout must hold.
  for (const [name, route] of [
    ['all-dreams:list', { kind: 'all' }],
    ['archive:list', { kind: 'archive' }],
  ]) {
    await go(route)
    const seg = page.locator('.fn-segment button', { hasText: /^list$/ }).first()
    if (await seg.count()) {
      await seg.click()
      await page.waitForTimeout(200)
      await scan(name)
    } else note(vpName, name, 'list/cards segmented control not found')
  }

  // Inbox page-header buttons: they reuse the .fn-topbar-actions class, and
  // an unscoped topbar rule once collapsed them into blank 32px squares.
  await go({ kind: 'inbox' })
  const inboxButtons = await page.evaluate(() =>
    [...document.querySelectorAll('.inbox-page .fn-topbar-actions .fn-btn')].map(b => ({
      w: Math.round(b.getBoundingClientRect().width),
      text: b.textContent.trim().slice(0, 24),
      fontSize: parseFloat(getComputedStyle(b).fontSize),
    }))
  )
  if (inboxButtons.length !== 2) note(vpName, 'inbox', `expected 2 header buttons, found ${inboxButtons.length}`)
  for (const b of inboxButtons) {
    if (b.w < 80 || b.fontSize === 0) note(vpName, 'inbox', `header button "${b.text}" collapsed (${b.w}px wide, font-size ${b.fontSize})`)
  }

  // Onboarding tour, first step: the spotlight must land on something that
  // is actually rendered at this width (the rail is display:none on phones;
  // the tour derives its first step from the shell it finds).
  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem('fn:onboarding:v1')
    } catch {
      /* no-op */
    }
  })
  await go({ kind: 'today' })
  await page.waitForTimeout(400)
  const tour = await page.evaluate(() => {
    const spot = document.querySelector('.fn-tour-spotlight')
    const card = document.querySelector('.fn-tour-card')
    if (!card) return { card: false }
    const s = spot ? spot.getBoundingClientRect() : null
    return {
      card: true,
      spot: s ? { w: Math.round(s.width), h: Math.round(s.height), right: Math.round(s.right), bottom: Math.round(s.bottom) } : null,
      title: card.querySelector('h2')?.textContent,
    }
  })
  if (!tour.card) note(vpName, 'tour', 'tour did not open for a fresh visitor')
  else if (!tour.spot || tour.spot.w < 40 || tour.spot.h < 20) note(vpName, 'tour', `step "${tour.title}" spotlights nothing rendered (${JSON.stringify(tour.spot)})`)
  // The spotlight pads its target by 8px on every side, so a target flush
  // with a viewport edge (the rail, the bottom tab bar) legitimately
  // extends 8px past it.
  else if (tour.spot.right > width + 9 || tour.spot.bottom > height + 9) note(vpName, 'tour', `step "${tour.title}" spotlight is off-screen`)
  await page.keyboard.press('Escape').catch(() => {})

  await ctx.close()
}

await browser.close()
console.log('')
if (issues.length === 0) console.log('✓ mobile sweep clean across ' + VIEWPORTS.length + ' viewports')
else {
  console.log(`${issues.length} issue(s):`)
  issues.forEach(i => console.log('  ✗ ' + i))
  process.exitCode = 1
}
