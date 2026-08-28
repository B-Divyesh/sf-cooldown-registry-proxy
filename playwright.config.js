import { defineConfig } from '@playwright/test'

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL

export default defineConfig({
  testDir: './site/browser',
  timeout: 30_000,
  use: { baseURL: externalBaseURL || 'http://127.0.0.1:4173', browserName: 'chromium', headless: true },
  webServer: externalBaseURL ? undefined : { command: 'npm run build:site && node site/test-server.js', port: 4173, reuseExistingServer: false }
})
