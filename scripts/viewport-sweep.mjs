/* Viewport sweep — measures Dreamcatcher's key screens across the real
 * device matrix and reports layout defects: sideways scroll, a top bar that
 * grows unreasonably tall, the Rail actually disappearing below 900px (it is
 * `display:none` on phones now — the bottom tab bar `.fn-mtab` is the primary
 * nav there instead, checked in mobile-sweep.mjs), the New Dream modal not
 * fitting a short viewport (`.fn-modal-backdrop` has no overflow-y and
 * `.fn-modal` uses `overflow: hidden` with no internal scroll — a tall form
 * on a short viewport has nowhere to go), and the AI Assistant side panel
 * not fitting (it should always fit because `.fn-ai-body` scrolls).
 *
 *   BASE_URL=https://… node scripts/viewport-sweep.mjs   (defaults to live)
 */
import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://garthpuckerin-dreamcatcher.vercel.app'

const VIEWPORTS = [
  ['phone-P small', 360, 800], ['phone-P', 390, 844], ['phone-P max', 430, 932],
  ['phone-L SE', 667, 375], ['phone-L', 844, 390], ['phone-L max', 932, 430],
  ['tablet-P', 768, 1024], ['tablet-P big', 834, 1194], ['tablet-L', 1024, 768], ['tablet-L big', 1194, 834],
  ['laptop short', 1280, 720], ['laptop', 1366, 768], ['laptop 125%', 1536, 864],
  ['desktop FHD', 1920, 1080], ['desktop QHD', 2560, 1440],
]

const SCREENS = [
  ['today', { kind: 'today' }],
  ['all-dreams', { kind: 'all' }],
  ['dream-detail', { kind: 'dream', id: 1 }],
  ['revisions', { kind: 'revisions' }],
  ['graph', { kind: 'graph' }],
  ['settings', { kind: 'settings' }],
]

const browser = await chromium.launch()
const issues = []
const note = (vp, screen, what) => issues.push(`${vp} · ${screen}: ${what}`)

for (const [vpName, width, height] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('fn:session:v1', 'active')
      window.localStorage.setItem('fn:onboarding:v1', 'done')
    } catch (e) {
      /* no-op */
    }
  })

  for (const [scrName, route] of SCREENS) {
    await page.addInitScript(r => {
      try {
        window.localStorage.setItem('fn:route:v1', JSON.stringify(r))
      } catch (e) {
        /* no-op */
      }
    }, route)
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.fn-shell', { timeout: 10000 }).catch(() => note(vpName, scrName, 'shell never rendered'))
    await page.waitForTimeout(300)

    const m = await page.evaluate(() => {
      const r = sel => {
        const el = document.querySelector(sel)
        if (!el) return null
        const b = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        return { x: b.x, y: b.y, w: b.width, h: b.height, bottom: b.bottom, right: b.right, display: cs.display, overflowX: cs.overflowX, overflowY: cs.overflowY }
      }
      const rail = r('.fn-rail')
      const mtab = r('.fn-mtab')
      const search = r('.fn-search')
      const actions = r('.fn-topbar-actions')
      const overlapX = search && actions ? Math.min(search.right, actions.right) - Math.max(search.x, actions.x) : 0
      const overlapY = search && actions ? Math.min(search.bottom, actions.bottom) - Math.max(search.y, actions.y) : 0
      return {
        vw: innerWidth,
        vh: innerHeight,
        scrollW: document.documentElement.scrollWidth,
        rail,
        mtab,
        topbar: r('.fn-topbar'),
        search,
        actions,
        searchActionsOverlapPx: search && actions ? Math.max(0, overlapX) : 0,
        searchActionsOverlapY: search && actions ? overlapY : 0,
      }
    })

    if (m.scrollW > m.vw + 1) note(vpName, scrName, `sideways scroll (${m.scrollW} > ${m.vw})`)

    const phoneRailTier = width <= 900
    if (phoneRailTier && m.rail && m.rail.display !== 'none') {
      // Below 900px the Rail must not render at all — it is `display:none`
      // in favor of the bottom tab bar (`.fn-mtab`); a visible Rail here
      // means the old collapsed-top-strip layout regressed back in.
      note(vpName, scrName, `Rail is visible below 900px (display: ${m.rail.display}) — expected display:none in favor of the bottom tab bar`)
    }
    if (phoneRailTier && (!m.mtab || m.mtab.display === 'none')) {
      note(vpName, scrName, 'bottom tab bar (.fn-mtab) is not rendered below 900px')
    }
    if (!phoneRailTier && m.mtab && m.mtab.display !== 'none') {
      note(vpName, scrName, `bottom tab bar (.fn-mtab) is visible above the mobile tier (display: ${m.mtab.display})`)
    }
    if (!phoneRailTier && m.rail && m.rail.w > 340) {
      note(vpName, scrName, `Rail unexpectedly wide (${Math.round(m.rail.w)}px) above the mobile collapse tier`)
    }
    if (m.topbar && m.topbar.h > 120) note(vpName, scrName, `top bar ${Math.round(m.topbar.h)}px tall`)
    // The search pill and the topbar action buttons (Assistant / New Dream /
    // New Fragment) are separate flex children of the same row — if the
    // search pill doesn't shrink to make room, it physically overlaps the
    // action buttons and makes them unclickable.
    if (m.searchActionsOverlapPx > 2 && m.searchActionsOverlapY > 2) {
      note(
        vpName,
        scrName,
        `.fn-search overlaps .fn-topbar-actions by ${Math.round(m.searchActionsOverlapPx)}px — action buttons (Assistant/New Dream/New Fragment) are behind the search pill and cannot be clicked`
      )
    }
  }

  // Modal fit: the New Dream modal has no internal scroll body and its
  // backdrop doesn't scroll either — a real risk on short viewports.
  await page.addInitScript(r => {
    try {
      window.localStorage.setItem('fn:route:v1', JSON.stringify(r))
    } catch (e) {
      /* no-op */
    }
  }, { kind: 'all' })
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.fn-shell', { timeout: 10000 }).catch(() => {})
  const modalOpened = await page.getByRole('button', { name: /New Dream/ }).first().click({ timeout: 5000 }).then(() => true).catch(() => false)
  if (modalOpened) {
    await page.waitForTimeout(250)
    const mm = await page.evaluate(() => {
      const card = document.querySelector('.fn-modal[role="dialog"]')
      const backdrop = document.querySelector('.fn-modal-backdrop')
      if (!card || !backdrop) return null
      const b = card.getBoundingClientRect()
      return {
        h: b.height,
        top: b.top,
        bottom: b.bottom,
        vh: innerHeight,
        cardOverflowY: getComputedStyle(card).overflowY,
        backdropOverflowY: getComputedStyle(backdrop).overflowY,
      }
    })
    if (!mm) note(vpName, 'modal', 'New Dream modal did not open')
    else {
      const canScroll = ['auto', 'scroll'].includes(mm.cardOverflowY) || ['auto', 'scroll'].includes(mm.backdropOverflowY)
      if ((mm.bottom > mm.vh + 1 || mm.top < -1) && !canScroll) {
        note(vpName, 'modal', `New Dream modal ${Math.round(mm.h)}px doesn't fit ${mm.vh}px and neither the card nor the backdrop scrolls`)
      }
    }
    await page.keyboard.press('Escape').catch(() => {})
  } else note(vpName, 'modal', 'could not open the New Dream modal (control not reachable)')

  // Drawer fit: the AI Assistant side panel — should always fit because its
  // body (`.fn-ai-body`) is a scroll region.
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.fn-shell', { timeout: 10000 }).catch(() => {})
  const aiOpened = await page.getByRole('button', { name: /Assistant/ }).first().click({ timeout: 5000 }).then(() => true).catch(() => false)
  if (aiOpened) {
    await page.waitForTimeout(250)
    const dd = await page.evaluate(() => {
      const p = document.querySelector('.fn-ai-panel[role="dialog"]')
      const body = document.querySelector('.fn-ai-body')
      if (!p) return null
      const b = p.getBoundingClientRect()
      return { w: b.width, h: b.height, vw: innerWidth, vh: innerHeight, bodyScrolls: body ? getComputedStyle(body).overflowY : null }
    })
    if (!dd) note(vpName, 'drawer', 'AI Assistant panel did not open')
    else {
      if (dd.h > dd.vh + 1) note(vpName, 'drawer', `AI Assistant panel taller than viewport (${Math.round(dd.h)} > ${dd.vh})`)
      if (!['auto', 'scroll'].includes(dd.bodyScrolls)) note(vpName, 'drawer', `AI Assistant body doesn't scroll (${dd.bodyScrolls})`)
    }
    await page.keyboard.press('Escape').catch(() => {})
  } else note(vpName, 'drawer', 'could not open the AI Assistant panel')

  // Auth screen fit (fresh visitor — session cleared for this one page only).
  const fresh = await ctx.newPage()
  await fresh.addInitScript(() => {
    try {
      window.localStorage.removeItem('fn:session:v1')
    } catch (e) {
      /* no-op */
    }
  })
  await fresh.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  const lm = await fresh.evaluate(() => {
    const cta = document.querySelector('.auth-submit')
    return { sideways: document.documentElement.scrollWidth > innerWidth + 1, cta: !!cta }
  })
  if (lm.sideways) note(vpName, 'auth', 'sideways scroll')
  if (!lm.cta) note(vpName, 'auth', 'sign-in CTA missing')

  await ctx.close()
}

await browser.close()
console.log('')
if (issues.length === 0) console.log('✓ viewport sweep clean across ' + VIEWPORTS.length + ' viewports')
else {
  console.log(`${issues.length} issue(s):`)
  issues.forEach(i => console.log('  ✗ ' + i))
  process.exitCode = 1
}
