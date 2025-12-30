import { defineConfig } from '@playwright/test'

export default defineConfig({
  webServer: {
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
  testDir: 'tests',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },
  reporter: [['html', { open: 'never' }], ['list']],
})
