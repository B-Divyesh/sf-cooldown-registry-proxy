import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './site/browser',
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium', headless: true },
  webServer: { command: 'npm run build:site && npx vite preview --outDir dist/site --host 127.0.0.1 --port 4173', port: 4173, reuseExistingServer: false }
})
