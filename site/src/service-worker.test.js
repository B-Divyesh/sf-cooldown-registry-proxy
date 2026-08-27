import test from 'node:test'
import assert from 'node:assert/strict'
import { renderServiceWorker } from './service-worker.js'

test('release worker precaches the generated JS and CSS shell', () => {
  const worker = renderServiceWorker({
    cacheName: 'cooldown-shell-a1b2c3d4e5f6',
    precache: ['/', '/assets/main-a1b2.js', '/assets/main-c3d4.css']
  })
  assert.match(worker, /cooldown-shell-a1b2c3d4e5f6/)
  assert.match(worker, /assets\/main-a1b2\.js/)
  assert.match(worker, /assets\/main-c3d4\.css/)
  assert.match(worker, /caches\.match\(event\.request\)/)
})

test('waiting updates activate only after an explicit client message', () => {
  const worker = renderServiceWorker({ cacheName: 'cooldown-shell-next', precache: ['/'] })
  assert.match(worker, /COOLDOWN_ACTIVATE_UPDATE/)
  assert.match(worker, /self\.skipWaiting\(\)/)
  assert.match(worker, /self\.clients\.claim\(\)/)
  const installSection = worker.slice(worker.indexOf("'install'"), worker.indexOf("'message'"))
  assert.doesNotMatch(installSection, /skipWaiting/)
})
