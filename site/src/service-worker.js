export function renderServiceWorker({ cacheName, precache }) {
  return `const CACHE = ${JSON.stringify(cacheName)}
const PRECACHE = ${JSON.stringify(precache)}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)))
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'COOLDOWN_ACTIVATE_UPDATE') self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('cooldown-shell-') && key !== CACHE).map((key) => caches.delete(key)))),
    self.clients.claim()
  ]))
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return
  const url = new URL(event.request.url)
  const shellRequest = PRECACHE.includes(url.pathname)

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match('/'))))
    return
  }

  if (shellRequest) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)))
  }
})
`
}
