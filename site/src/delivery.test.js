import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const config = JSON.parse(readFileSync(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8'))

test('Static Web Apps applies immutable caching and browser hardening', () => {
  const immutableAssets = config.routes.find((route) => route.route === '/assets/*')
  assert.equal(immutableAssets.headers['Cache-Control'], 'public, max-age=31536000, immutable')
  assert.match(config.globalHeaders['Content-Security-Policy'], /frame-ancestors 'none'/)
  assert.equal(config.globalHeaders['X-Frame-Options'], 'DENY')
  assert.match(config.globalHeaders['Permissions-Policy'], /camera=\(\)/)
  assert.match(config.globalHeaders['Strict-Transport-Security'], /max-age=31536000/)
  assert.equal(config.responseOverrides['404'].rewrite, '/404.html')
  assert.equal(config.responseOverrides['404'].statusCode, 404)
  assert.equal(config.routes.find((route) => route.route === '/demo').rewrite, '/demo/index.html')
  assert.match(config.globalHeaders['Content-Security-Policy'], /connect-src 'self'/)
  assert.doesNotMatch(config.globalHeaders['Content-Security-Policy'], /api\.sociobot\.in/)
})
