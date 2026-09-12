import { test, expect } from '@playwright/test'

test.describe('Layout measurements (AFTER fixes)', () => {
  test('Fix 1: auth form height EQUAL in sign-in vs sign-up mode', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.removeItem('fn:session:v1')
    })
    await page.goto('/')

    // Measure sign-in mode
    const signInHeight = await page.evaluate(() => {
      const form = document.querySelector('.auth-form')
      return form ? form.getBoundingClientRect().height : -1
    })
    console.log(`[AFTER] Auth form height in SIGN-IN mode: ${signInHeight}px`)

    // Click "Sign up" tab
    await page.getByRole('tab', { name: 'Sign up' }).click()

    // Measure sign-up mode
    const signUpHeight = await page.evaluate(() => {
      const form = document.querySelector('.auth-form')
      return form ? form.getBoundingClientRect().height : -1
    })
    console.log(`[AFTER] Auth form height in SIGN-UP mode: ${signUpHeight}px`)
    console.log(`[AFTER] Auth form height DIFF: ${Math.abs(signUpHeight - signInHeight)}px`)

    expect(signInHeight).toBeGreaterThan(0)
    expect(signUpHeight).toBeGreaterThan(0)
    // After fix: heights must match within 1px
    expect(Math.abs(signUpHeight - signInHeight)).toBeLessThanOrEqual(1)
    console.log(`[AFTER] Heights equal (≤1px diff): TRUE`)
  })

  test('Fix 2: rail-head vs topbar alignment (must remain aligned)', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('fn:session:v1', 'active')
    })
    await page.goto('/')

    const railHead = await page.evaluate(() => {
      const el = document.querySelector('.fn-rail-head')
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { top: r.top, height: r.height, bottom: r.bottom }
    })
    console.log(`[AFTER] Rail head: top=${railHead?.top} height=${railHead?.height} bottom=${railHead?.bottom}`)

    const topbar = await page.evaluate(() => {
      const el = document.querySelector('.fn-topbar')
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { top: r.top, height: r.height, bottom: r.bottom }
    })
    console.log(`[AFTER] Topbar:    top=${topbar?.top} height=${topbar?.height} bottom=${topbar?.bottom}`)

    expect(railHead).not.toBeNull()
    expect(topbar).not.toBeNull()
    expect(Math.abs(topbar.top - railHead.top)).toBeLessThanOrEqual(1)
    expect(Math.abs(topbar.height - railHead.height)).toBeLessThanOrEqual(1)
    console.log(`[AFTER] Rail/topbar aligned (height diff ≤1px): TRUE`)
  })
})
