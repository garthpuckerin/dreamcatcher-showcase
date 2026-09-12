// Capture the demo's own Open Graph card (public/og.png) — polish checklist
// §6: a real 1200×630 og:image from the actual default theme, never a gray
// box or a stale shot. The Today screen is the first app screen a visitor
// sees after the auth gate, so it is the card.
//
//   node scripts/capture-og.mjs                  # local: serves dist/ itself
//   OG_URL=https://garthpuckerin-dreamcatcher.vercel.app node scripts/capture-og.mjs
//
// Local is the default so the card always matches the build about to ship
// (run after `npm run build`, before committing). Captured at a 1200×630
// viewport at 2× (2400×1260). The image ships with the demo, so index.html's
// og:image URL is absolute.
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..')
const out = path.resolve(repoRoot, 'public', 'og.png')

let server = null
let base = process.env.OG_URL?.replace(/\/$/, '')
if (!base) {
  server = await preview({ root: repoRoot, preview: { host: '127.0.0.1', port: 0 } })
  base = server.resolvedUrls.local[0].replace(/\/$/, '')
}

const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('fn:session:v1', 'active')
      localStorage.setItem('fn:onboarding:v1', 'done')
      localStorage.setItem('fn:route:v1', JSON.stringify({ kind: 'today' }))
    } catch {
      /* no-op */
    }
  })
  await page.goto(base + '/', { waitUntil: 'networkidle' })
  await page.waitForSelector('.fn-shell', { timeout: 15000 })
  await page.evaluate(() => document.fonts?.ready)
  await page.waitForTimeout(400)
  await mkdir(path.dirname(out), { recursive: true })
  await page.screenshot({ path: out, fullPage: false })
  console.log(`wrote ${path.relative(repoRoot, out)} from ${base}`)
} finally {
  await browser.close()
  if (server) await server.close()
}
