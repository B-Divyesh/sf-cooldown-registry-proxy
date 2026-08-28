import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const [path, title] of [['/', /Cooldown Proxy/], ['/demo/', 'Demo — Cooldown Proxy'], ['/privacy/', 'Privacy — Cooldown Proxy'], ['/terms/', 'Terms — Cooldown Proxy']]) {
  test(`route ${path} has semantic shell and no serious axe issues`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveTitle(title)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveCount(1)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations.filter((item) => ['critical', 'serious'].includes(item.impact))).toEqual([])
  })
}

test('@claim:demo-isolation demo is isolated, resettable, and has no third-party requests', async ({ page }) => {
  const requests = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/demo/')
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Start for real' })).toBeVisible()
  await expect(page.locator('.release')).toHaveCount(3)
  await page.getByLabel('Minimum release age').fill('1')
  await page.getByRole('button', { name: 'Reset demo' }).click()
  await expect(page.getByLabel('Minimum release age')).toHaveValue('7')
  const keys = await page.evaluate(() => Object.keys(localStorage))
  expect(keys).toEqual(['demo:cooldown-registry-proxy:policy'])
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy()
})

test('@claim:offline-sample demo reloads offline after service-worker control', async ({ page, context }) => {
  await page.goto('/demo/')
  await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => navigator.serviceWorker.controller !== null))
  await page.reload()
  await expect(page.locator('.release')).toHaveCount(3)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Check three package decisions.')
  await expect(page.locator('.release')).toHaveCount(3)
})

test('query demo entry redirects to the isolated demo and the first screen is clear at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?demo=1')
  await expect(page).toHaveURL(/\/demo\/$/)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Block new packages until their cooldown ends.')
  await expect(page.locator('.hero').getByRole('link', { name: 'Try it with sample data' })).toBeVisible()
  await expect(page.getByText('For platform and security teams')).toBeVisible()
})

test('route loads focus its heading for keyboard and screen-reader users', async ({ page }) => {
  await page.goto('/privacy/')
  await expect(page.locator('h1')).toBeFocused()
  await page.goto('/demo/')
  await expect(page.locator('h1')).toBeFocused()
})
