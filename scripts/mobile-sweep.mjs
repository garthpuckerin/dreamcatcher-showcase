/* Mobile/tablet white-glove sweep — the defect classes the viewport sweep
 * measures at the pixel level but doesn't walk every screen for: nested
 * scroll regions, over-columned grids, and sideways scroll.
 *
 * HONESTY NOTE: Dreamcatcher has NO dedicated mobile companion surface (no
 * bottom tab bar, no `.mtab`-equivalent, no separate mobile shell/component
 * tree). Below 900px the same `.fn-rail` collapses from a vertical column
 * into a horizontally-scrolling top strip (`overflow-x: auto`), and below
 * 640px only the first Rail section (Workspace: Today/All Dreams/Inbox/AI
 * Suggestions/Archive) stays visible — Brands, Tools (including Revisions
 * and Graph), and Recent are hidden by `.fn-rail-section:nth-of-type(n+2) {
 * display: none }` and are reachable on a phone ONLY via the Command
 * Palette (tap the search pill in the topbar). That is a real, load-bearing
 * navigation constraint on phones, not a bug this sweep asserts against —
 * it is called out here so it isn't rediscovered as a mystery later. The
 * bottom-tab-bar-collision check from the house template is therefore
 * dropped (there is no bottom tab bar to collide with anything); the
 * checks that apply regardless of a dedicated mobile mode — sideways
 * scroll, nested scroll regions, over-columned grids — are kept.
 *
 *  1. Nested scroll regions on phones — anything that scrolls inside the
 *     page besides the one legitimate scroll surface (`.fn-main-scroll` /
 *     `.fn-scroll`), a drawer/modal/dialog, or the Rail's own intentional
 *     horizontal strip.
 *  2. Grids that stay multi-column at widths where they can't afford to.
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
const GRID_ALLOW = ['fn-stats', 'fn-field-grid', 'settings-control-group', 'graph-legend', 'fn-todo', 'fn-collab-row', 'heatmap']

// Elements with their own deliberate horizontal scroll, verified by reading
// their CSS: `.builder-matrix` is a dense feature-comparison table given
// `overflow-x: auto` (with `.builder-matrix-row { min-width: 920px }`)
// specifically so it scrolls sideways rather than illegibly compressing —
// unlike an accidental nested-scroll region, this is the documented pattern
// for a table too wide to reflow, applied at every tier including phone.
const SANCTIONED_XSCROLL = ['builder-matrix']

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
    } catch (e) {
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
      ({ tier, maxCols, allow, sanctionedXScroll }) => {
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

        return out
      },
      { tier, maxCols: MAX_COLS[tier], allow: GRID_ALLOW, sanctionedXScroll: SANCTIONED_XSCROLL }
    )
    for (const w of [...new Set(r)]) note(vpName, screen, w)
  }

  const go = async route => {
    await page.addInitScript(r => {
      try {
        window.localStorage.setItem('fn:route:v1', JSON.stringify(r))
      } catch (e) {
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
