import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const root = new URL('../dist/site/', import.meta.url).pathname
const port = Number(process.env.PORT || 4173)
const knownDirectories = new Set(['/demo', '/privacy', '/terms'])
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8'
}

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname)
  const relative = pathname === '/'
    ? 'index.html'
    : knownDirectories.has(pathname)
      ? `${pathname.slice(1)}/index.html`
      : pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : pathname.slice(1)
  const safePath = normalize(relative).replace(/^(\.\.[/\\])+/, '')
  let status = 200
  let body
  let file = join(root, safePath)
  try {
    body = await readFile(file)
  } catch {
    status = 404
    file = join(root, '404.html')
    body = await readFile(file)
  }
  response.writeHead(status, {
    'Content-Type': contentTypes[extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff'
  })
  if (request.method === 'HEAD') response.end()
  else response.end(body)
}).listen(port, '127.0.0.1', () => console.log(`site test server listening on ${port}`))
