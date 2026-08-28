import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { renderServiceWorker } from './src/service-worker.js'

const root = import.meta.dirname
const siteOutput = resolve(root, '../dist/site')
const publicShellFiles = ['mark.svg', 'topographic-quarantine.webp', 'demo-terminal.svg']

function serviceWorkerPlugin() {
  return {
    name: 'cooldown-service-worker',
    closeBundle() {
      const manifest = JSON.parse(readFileSync(resolve(siteOutput, '.vite/manifest.json'), 'utf8'))
      const generatedShell = [...new Set(Object.values(manifest).flatMap((entry) => [entry.file, ...(entry.css || [])]))]
        .filter((file) => /\.(?:js|css)$/.test(file))
        .sort()
      const precache = ['/', '/demo/', '/privacy/', '/terms/', '/404.html', ...publicShellFiles.map((file) => `/${file}`), ...generatedShell.map((file) => `/${file}`)]
      const revision = createHash('sha256')
        .update(JSON.stringify(precache))
        .update(generatedShell.map((file) => readFileSync(resolve(siteOutput, file))).join(''))
        .update(publicShellFiles.map((file) => readFileSync(resolve(root, 'public', file))).join(''))
        .digest('hex')
        .slice(0, 12)

      writeFileSync(resolve(siteOutput, 'sw.js'), renderServiceWorker({
        cacheName: `cooldown-shell-${revision}`,
        precache
      }))
    }
  }
}

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        demo: resolve(import.meta.dirname, 'demo/index.html'),
        privacy: resolve(import.meta.dirname, 'privacy/index.html'),
        terms: resolve(import.meta.dirname, 'terms/index.html'),
        notFound: resolve(import.meta.dirname, '404.html')
      }
    }
  },
  plugins: [serviceWorkerPlugin()]
})
