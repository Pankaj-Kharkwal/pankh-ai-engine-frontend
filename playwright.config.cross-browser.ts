import { defineConfig, devices } from '@playwright/test';

const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3001';

/**
 * Cross-browser configuration for UI component testing
 * Tests button components across different browsers and devices
 */
export default defineConfig({
  testDir: 'tests',

  // Global test timeout
  timeout: 30_000,

  // Expect timeout for assertions
  expect: {
    timeout: 10_000,
  },

  // Retry failed tests
  retries: process.env.CI ? 2 : 1,

  // Number of parallel workers
  workers: process.env.CI ? 2 : 4,

  // Test output directory
  outputDir: 'test-results/',

  // Screenshot capture settings
  use: {
    baseURL: APP_URL,

    // Capture screenshots on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Capture trace on failure
    trace: 'on-first-retry',

    // Ignore HTTPS errors for development
    ignoreHTTPSErrors: true,
  },

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: APP_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  // Projects for different browsers and devices
  projects: [
    // Desktop Browsers
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: 'tests/ui-components/**/*.spec.ts',
    },

    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: 'tests/ui-components/**/*.spec.ts',
    },

    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: 'tests/ui-components/**/*.spec.ts',
    },

    // Edge Browser
    {
      name: 'edge-desktop',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: 'tests/ui-components/**/*.spec.ts',
    },

    // Mobile Devices
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
      testMatch: 'tests/ui-components/**/*.spec.ts',
    },

    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
      testMatch: 'tests/ui-components/**/*.spec.ts',
    },

    // Tablet Devices
    {
      name: 'tablet-chrome',
      use: {
        ...devices['iPad Pro'],
      },
      testMatch: 'tests/ui-components/**/*.spec.ts',
    },

    // High DPI / Retina Displays
    {
      name: 'retina-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
      testMatch: 'tests/ui-components/**/*.spec.ts',
    },

    // Different Screen Sizes
    {
      name: 'small-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
      testMatch: 'tests/ui-components/**/*.spec.ts',
    },

    {
      name: 'large-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: 'tests/ui-components/**/*.spec.ts',
    },

    // Accessibility Testing
    {
      name: 'accessibility-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Force prefers-reduced-motion for accessibility testing
        extraHTTPHeaders: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
      },
      testMatch: 'tests/ui-components/**/*.spec.ts',
      testIgnore: ['tests/ui-components/visual-regression/**'],
    },

    // Visual Regression Testing (Chromium only for consistency)
    {
      name: 'visual-regression',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Ensure consistent font rendering
        fontFamily: 'Arial, sans-serif',
        // Disable animations for consistent screenshots
        reducedMotion: 'reduce',
      },
      testMatch: 'tests/ui-components/visual-regression/**/*.spec.ts',
    },
  ],

  // Global test configurations
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),

  // Reporter configuration
  reporter: [
    // Console output
    ['list'],

    // HTML report
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never'
    }],

    // JUnit XML for CI
    ['junit', {
      outputFile: 'test-results/junit.xml'
    }],

    // JSON report
    ['json', {
      outputFile: 'test-results/results.json'
    }],

    // Allure reporter (if installed)
    // ['allure-playwright'],
  ],

  // Test metadata
  metadata: {
    project: 'Pankh AI WebUI',
    testType: 'UI Component Testing',
    environment: process.env.NODE_ENV || 'development',
    buildNumber: process.env.BUILD_NUMBER || 'local',
  },
});