import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync } from 'node:fs'

const routes = [
  ['/', 'Cooldown Proxy — block packages that are too new'],
  ['/demo/', 'Demo — Cooldown Proxy'],
  ['/privacy/', 'Privacy — Cooldown Proxy'],
  ['/terms/', 'Terms — Cooldown Proxy']
]

for (const [path, title] of routes) {
  test(`route ${path} has complete metadata, semantic shell, and no serious axe issues`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveTitle(title)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(1)
    await expect(page.locator('meta[name="twitter:title"]')).toHaveCount(1)
    await expect(page.locator('meta[name="twitter:description"]')).toHaveCount(1)
    await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations.filter((item) => ['critical', 'serious'].includes(item.impact))).toEqual([])
  })
}

test('@claim:demo-isolation demo preserves real data, resets its own key, and discards it on exit', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    const originals = {
      getItem: Storage.prototype.getItem,
      setItem: Storage.prototype.setItem,
      removeItem: Storage.prototype.removeItem,
      clear: Storage.prototype.clear
    }
    const operations = []
    Object.defineProperty(window, '__storageOperations', { value: operations })
    Object.defineProperty(window, '__readStorageWithoutTrace', {
      value: (key) => originals.getItem.call(localStorage, key)
    })
    for (const method of Object.keys(originals)) {
      Storage.prototype[method] = function (...args) {
        operations.push({ method, key: args[0] ?? null })
        return originals[method].apply(this, args)
      }
    }
    originals.setItem.call(localStorage, 'real:operator-settings', 'keep-me')
  })
  await page.goto('/?demo=1')
  await expect(page).toHaveURL(/\/demo\/$/)
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Start for real' })).toBeVisible()
  await expect(page.locator('.release')).toHaveCount(3)
  await page.getByLabel('Minimum release age').fill('1')
  await page.getByRole('button', { name: 'Reset demo' }).click()
  await expect(page.getByLabel('Minimum release age')).toHaveValue('7')
  expect(await page.evaluate(() => window.__readStorageWithoutTrace('real:operator-settings'))).toBe('keep-me')
  expect(await page.evaluate(() => Object.keys(localStorage).sort())).toEqual([
    'demo:cooldown-registry-proxy:policy',
    'real:operator-settings'
  ])
  const operations = await page.evaluate(() => window.__storageOperations)
  expect(operations.length).toBeGreaterThan(0)
  expect(operations.every(({ key }) => key === 'demo:cooldown-registry-proxy:policy')).toBeTruthy()
  expect(operations.some(({ method }) => method === 'getItem')).toBeTruthy()
  expect(operations.some(({ method }) => method === 'setItem')).toBeTruthy()
  expect(operations.some(({ method }) => method === 'removeItem')).toBeTruthy()
  await page.locator('footer').scrollIntoViewIfNeeded()
  await expect(page.locator('.demo-banner')).toBeVisible()
  await page.getByRole('link', { name: 'Start for real' }).click()
  expect(new URL(page.url()).pathname).toBe('/')
  expect(await page.evaluate(() => window.__readStorageWithoutTrace('demo:cooldown-registry-proxy:policy'))).toBeNull()
  expect(await page.evaluate(() => window.__readStorageWithoutTrace('real:operator-settings'))).toBe('keep-me')
})

test('@claim:offline-sample demo reloads offline after its first visit', async ({ page, context }) => {
  await page.goto('/demo/')
  await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => navigator.serviceWorker.controller !== null))
  await page.reload()
  await expect(page.locator('.release')).toHaveCount(3)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Check three package decisions.')
  await expect(page.locator('.release')).toHaveCount(3)
})

test('@claim:sample-values default sample names, ages, cooldown, and statuses are exact', async ({ page }) => {
  await page.goto('/?demo=1')
  await expect(page.locator('#cooldown-output')).toHaveText('7 days')
  await expect(page.getByText('npm · v4.8.0 · 0.8d old', { exact: true })).toBeVisible()
  await expect(page.getByText('PyPI · v2.3.1 · 10d old', { exact: true })).toBeVisible()
  await expect(page.getByText('Cargo · v0.9.6 · 32d old', { exact: true })).toBeVisible()
  await expect(page.getByText('7d remain before this version is allowed.', { exact: true })).toBeVisible()
  await expect(page.getByText('MAL-2026-041 blocks this version.', { exact: true })).toBeVisible()
})

test('@claim:site-privacy complete landing and demo flow makes only same-origin requests', async ({ page }) => {
  const requests = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/')
  const origin = new URL(page.url()).origin
  await page.getByRole('link', { name: 'Try it with sample data' }).first().click()
  await page.getByLabel('Minimum release age').fill('14')
  await page.getByLabel('Simulate upstream outage').check()
  await page.getByRole('button', { name: 'Reset demo' }).click()
  expect(requests.length).toBeGreaterThan(0)
  expect(requests.every((url) => new URL(url).origin === origin)).toBeTruthy()
})

test('mobile and desktop first screens show the job, user, action, outcome, and all three facts', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Block new packages until their cooldown ends.')
    await expect(page.locator('.hero').getByRole('link', { name: 'Try it with sample data' })).toBeVisible()
    await expect(page.getByText('For platform and security teams')).toBeVisible()
    await expect(page.getByText('See an allowed release, a cooldown block, and an advisory block.')).toBeVisible()
    for (const fact of ['Separate demo data', 'Demo reloads after one visit', 'MIT-licensed source']) {
      const box = await page.getByText(fact, { exact: true }).boundingBox()
      expect(box).not.toBeNull()
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
  }
})

test('one click shows all three demo outcomes in the first mobile and desktop viewport', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.locator('.hero').getByRole('link', { name: 'Try it with sample data' }).click()
    await expect(page).toHaveURL(/\/demo\/$/)
    for (const result of ['Blocked by cooldown', 'Allowed', 'Blocked by advisory']) {
      const box = await page.locator('.decision-summary').getByText(result, { exact: true }).boundingBox()
      expect(box).not.toBeNull()
      expect(box.y + box.height, `${result} should be above ${viewport.height}px`).toBeLessThanOrEqual(viewport.height)
    }
  }
})

test('direct routes, back navigation, heading focus, and the designed 404 work', async ({ page, request }) => {
  const demo = await request.get('/demo')
  expect(demo.status()).toBe(200)
  await page.goto('/')
  await expect(page.locator('h1')).toBeFocused()
  await page.locator('footer').scrollIntoViewIfNeeded()
  await page.locator('footer').getByRole('link', { name: 'Privacy' }).click()
  await expect(page).toHaveURL(/\/privacy\/$/)
  await expect(page.locator('h1')).toBeFocused()
  await page.goBack()
  expect(new URL(page.url()).pathname).toBe('/')
  await expect(page.locator('h1')).toBeFocused()
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(400)

  const response = await page.goto('/definitely-not-a-route')
  expect(response.status()).toBe(404)
  await expect(page).toHaveTitle('Page not found — Cooldown Proxy')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page is outside the map.')
  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations.filter((item) => ['critical', 'serious'].includes(item.impact))).toEqual([])
})

test('every internal and legal link resolves and external links name GitHub', async ({ page, request }) => {
  const hrefs = new Set()
  for (const [path] of routes) {
    await page.goto(path)
    for (const href of await page.locator('a[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
      hrefs.add(href)
    }
    for (const link of await page.locator('a[href^="https://"]').all()) {
      await expect(link).toContainText('GitHub')
    }
  }
  for (const href of hrefs) {
    if (!href.startsWith('/')) continue
    const path = href.split('#')[0] || '/'
    const response = await request.get(path)
    expect(response.status(), `${href} should resolve`).toBeLessThan(400)
  }
})

test('keyboard controls expose visible focus without traps', async ({ page }) => {
  await page.goto('/demo/')
  await expect(page.locator('h1')).toBeFocused()
  await page.getByRole('link', { name: 'Skip to main content' }).focus()
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
  await page.getByLabel('Minimum release age').focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByLabel('Minimum release age')).toHaveValue('8')
})

test('capture polish round three evidence at mobile and desktop sizes', async ({ page }) => {
  const evidence = '.factory/evidence/polish-3'
  mkdirSync(evidence, { recursive: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.screenshot({ path: `${evidence}/home-mobile.png`, fullPage: true })
  await page.goto('/demo/')
  await page.screenshot({ path: `${evidence}/demo-mobile.png`, fullPage: true })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.screenshot({ path: `${evidence}/home-desktop.png`, fullPage: true })
  await page.goto('/demo/')
  await page.screenshot({ path: `${evidence}/demo-desktop.png`, fullPage: true })
  await page.goto('/definitely-not-a-route')
  await page.screenshot({ path: `${evidence}/404-desktop.png`, fullPage: true })
})
