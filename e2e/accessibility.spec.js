// Accessibility gate — axe-core over every primary screen, at desktop and
// phone width, plus the overlays a visitor reaches from the topbar. Pattern
// ported from grant-tracker-showcase/e2e/accessibility.spec.js and adapted to
// Dreamcatcher's `fn:*` localStorage keys and `route.kind` router.
//
// The assertion is strict: any WCAG 2.x A/AA violation is a real defect. Do
// not add rule exclusions here to make it pass — fix the surface.
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const SCREENS = [
  ['today', { kind: 'today' }],
  ['all-dreams', { kind: 'all' }],
  ['inbox', { kind: 'inbox' }],
  ['suggestions', { kind: 'suggest' }],
  ['archive', { kind: 'archive' }],
  ['analytics', { kind: 'analytics' }],
  ['portfolio', { kind: 'portfolio' }],
  ['templates', { kind: 'templates' }],
  ['integrations', { kind: 'integrations' }],
  ['revisions', { kind: 'revisions' }],
  ['settings', { kind: 'settings' }],
  ['dream-detail', { kind: 'dream', id: 1 }],
  // Desk-only on phones (render the "stays at the desk" state there) —
  // still worth scanning at both widths.
  ['builder-notes', { kind: 'builder' }],
  ['graph', { kind: 'graph' }],
  ['case-study-composer', { kind: 'case', id: 7 }],
]

const VIEWPORTS = [
  ['desktop', { width: 1440, height: 900 }],
  ['phone', { width: 375, height: 812 }],
]

const formatViolations = violations =>
  violations
    .map(v => {
      const nodes = v.nodes
        .slice(0, 5)
        .map(n => `    ${n.target.join(' ')}\n      ${n.failureSummary || ''}`)
        .join('\n')
      return `[${v.impact}] ${v.id}: ${v.help}\n  ${v.helpUrl}\n${nodes}`
    })
    .join('\n\n')

const expectNoViolations = async (page, label) => {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  expect(violations, `${label}\n${formatViolations(violations)}`).toEqual([])
}

const enter = async (page, route) => {
  await page.addInitScript(r => {
    try {
      localStorage.setItem('fn:session:v1', 'active')
      localStorage.setItem('fn:onboarding:v1', 'done')
      localStorage.setItem('fn:route:v1', JSON.stringify(r))
    } catch {
      /* no-op */
    }
  }, route)
  await page.goto('/')
  await expect(page.locator('.fn-shell')).toBeVisible()
  await page
    .waitForFunction(() => !document.body.innerText.includes('Loading Builder Notes'), null, {
      timeout: 10_000,
    })
    .catch(() => {})
}

for (const [vpName, viewport] of VIEWPORTS) {
  test.describe(`axe · ${vpName}`, () => {
    test.use({ viewport })

    for (const [name, route] of SCREENS) {
      test(`${name} has no WCAG A/AA violations`, async ({ page }) => {
        await enter(page, route)
        await expectNoViolations(page, `${vpName} · ${name}`)
      })
    }

    test('auth screen has no WCAG A/AA violations', async ({ page }) => {
      await page.addInitScript(() => {
        try {
          localStorage.removeItem('fn:session:v1')
        } catch {
          /* no-op */
        }
      })
      await page.goto('/')
      await expect(page.locator('.auth-form')).toBeVisible()
      await expectNoViolations(page, `${vpName} · auth`)
    })

    test('AI Assistant panel has no WCAG A/AA violations', async ({ page }) => {
      await enter(page, { kind: 'all' })
      await page.getByRole('button', { name: /Assistant/ }).first().click()
      await expect(page.locator('.fn-ai-panel')).toBeVisible()
      await expectNoViolations(page, `${vpName} · ai-assistant`)
    })

    test('New Dream modal has no WCAG A/AA violations', async ({ page }) => {
      await enter(page, { kind: 'all' })
      await page.getByRole('button', { name: /New Dream/ }).first().click()
      await expect(page.locator('.fn-modal[role="dialog"]')).toBeVisible()
      await expectNoViolations(page, `${vpName} · new-dream`)
    })

    test('onboarding tour has no WCAG A/AA violations', async ({ page }) => {
      await page.addInitScript(() => {
        try {
          localStorage.setItem('fn:session:v1', 'active')
          localStorage.removeItem('fn:onboarding:v1')
          localStorage.setItem('fn:route:v1', JSON.stringify({ kind: 'today' }))
        } catch {
          /* no-op */
        }
      })
      await page.goto('/')
      await expect(page.locator('.fn-tour-card')).toBeVisible()
      await expectNoViolations(page, `${vpName} · tour`)
    })
  })
}
