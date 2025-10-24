import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    url: 'http://localhost:3001',
    reuseExistingServer: true,
  },
  testDir: 'tests',
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    launchOptions: { executablePath: 'C:\\Users\\pkhar\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1187\\chrome-win\\headless_shell.exe' },
  },
});
