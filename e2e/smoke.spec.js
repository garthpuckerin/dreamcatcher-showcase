// Dreamcatcher demo smoke test — proof-of-life (fixtures-only, zero network).
//
// Asserts:
//   1. The auth screen renders with the "dreamcatcher" brand mark.
//   2. Clicking a demo provider button enters the mock workspace.
//   3. The workspace renders fixture content ("Today" view headline visible).
//   4. ZERO browser console errors, ZERO page errors, ZERO failed network requests.
//
// Any failed request or console error is a genuine defect (residual backend
// coupling) — the assertion is intentionally strict and must not be weakened.

import { test, expect } from '@playwright/test'

test('fixtures-only render with zero console/page/network errors', async ({ page }) => {
  const consoleErrors = []
  const pageErrors = []
  const failedRequests = []

  // Register listeners BEFORE navigation
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  page.on('pageerror', err => {
    pageErrors.push(err.message)
  })

  page.on('requestfailed', request => {
    // Ignore browser-internal about: or chrome-extension: requests
    const url = request.url()
    if (!url.startsWith('about:') && !url.startsWith('chrome-extension:')) {
      failedRequests.push(`${request.method()} ${url} — ${request.failure()?.errorText}`)
    }
  })

  // Navigate to the app root
  await page.goto('/')

  // 1. Auth screen: brand mark is visible
  await expect(
    page.locator('.auth-mark'),
    'Auth screen brand mark "dreamcatcher" should be visible'
  ).toBeVisible()

  await expect(page.locator('.auth-mark')).toContainText('dreamcatcher')

  // 2. Click the first provider button to enter the mock workspace
  //    (all three call onAuthed() — no real auth occurs)
  const continueWithGoogle = page.locator('button.auth-provider').first()
  await expect(continueWithGoogle).toBeVisible()
  await continueWithGoogle.click()

  // 3. Workspace renders — Today view should be shown (default route after sign-in)
  //    The Today view renders fixture dreams; assert a stable fixture title is visible.
  //    Fixture dream id=1: "Dreamcatcher Workspace Foundation" (appears in the recent-dreams rail)
  await expect(
    page.locator('.fn-recent-title').filter({ hasText: 'Dreamcatcher Workspace Foundation' }).first(),
    'Fixture dream title should be visible in the workspace'
  ).toBeVisible({ timeout: 10_000 })

  // Also confirm the rail navigation is present (workspace shell rendered)
  await expect(
    page.locator('[data-fn-root]'),
    'The app root element should be in the DOM'
  ).toBeVisible()

  // 4. Strict error assertions — any entry here is a real defect
  expect(
    consoleErrors,
    `Console errors detected (${consoleErrors.length}): ${consoleErrors.join('; ')}`
  ).toHaveLength(0)

  expect(
    pageErrors,
    `Page errors detected (${pageErrors.length}): ${pageErrors.join('; ')}`
  ).toHaveLength(0)

  expect(
    failedRequests,
    `Failed network requests detected (${failedRequests.length}): ${failedRequests.join('; ')}`
  ).toHaveLength(0)
})
