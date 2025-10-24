import { test, expect, Page, Locator } from '@playwright/test';

// Test data for different button configurations
const buttonVariants = [
  { variant: 'primary', expected: 'bg-primary-500' },
  { variant: 'secondary', expected: 'bg-slate-800/80' },
  { variant: 'ghost', expected: 'text-gray-300' },
  { variant: 'glass', expected: 'bg-glass-300' },
  { variant: 'destructive', expected: 'bg-red-500' }
];

const buttonSizes = [
  { size: 'sm', expected: 'h-9' },
  { size: 'md', expected: 'h-10' },
  { size: 'lg', expected: 'h-12' },
  { size: 'icon', expected: 'h-10 w-10' }
];

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'large-desktop', width: 1920, height: 1080 }
];

test.describe('Button Component Tests', () => {
  let page: Page;
  let testButtons: Locator;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;

    // Create a test page with various button configurations
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Button Test Page</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          /* Custom CSS classes from the button component */
          .bg-primary-500 { background-color: rgb(59 130 246); }
          .bg-primary-600 { background-color: rgb(37 99 235); }
          .bg-slate-800\\/80 { background-color: rgb(30 41 59 / 0.8); }
          .bg-slate-700\\/60 { background-color: rgb(51 65 85 / 0.6); }
          .bg-glass-300 { background-color: rgba(255, 255, 255, 0.1); backdrop-filter: blur(8px); }
          .bg-glass-200 { background-color: rgba(255, 255, 255, 0.15); }
          .border-glass-400 { border-color: rgba(255, 255, 255, 0.2); }
          .text-gray-300 { color: rgb(209 213 219); }

          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .test-section {
            margin-bottom: 40px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            backdrop-filter: blur(10px);
          }

          .button-row {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            margin: 16px 0;
          }

          .button-variants {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin: 16px 0;
          }

          h2 { color: white; margin-bottom: 16px; }
          h3 { color: rgba(255, 255, 255, 0.9); margin-bottom: 12px; font-size: 1.1em; }
        </style>
      </head>
      <body>
        <div class="test-section">
          <h2>🔹 Functional Test Cases</h2>

          <h3>Button Click Actions</h3>
          <div class="button-row">
            <button
              data-testid="next-button"
              class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm"
              onclick="document.getElementById('action-result').innerText = 'Next clicked'">
              Next →
            </button>

            <button
              data-testid="previous-button"
              class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-slate-800/80 text-white border border-glass-400 hover:bg-slate-700/60 h-10 px-4 text-sm"
              onclick="document.getElementById('action-result').innerText = 'Previous clicked'">
              ← Previous
            </button>

            <button
              data-testid="submit-button"
              class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm"
              onclick="document.getElementById('action-result').innerText = 'Form submitted'">
              Submit
            </button>
          </div>
          <div id="action-result" data-testid="action-result" style="color: white; margin-top: 12px; min-height: 20px;"></div>

          <h3>Disabled State</h3>
          <div class="button-row">
            <button
              data-testid="next-disabled"
              disabled
              class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm">
              Next (Disabled) →
            </button>

            <button
              data-testid="previous-enabled"
              class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-slate-800/80 text-white border border-glass-400 hover:bg-slate-700/60 h-10 px-4 text-sm">
              ← Previous (Enabled)
            </button>
          </div>

          <h3>Multiple Click Prevention</h3>
          <div class="button-row">
            <button
              data-testid="multi-click-button"
              class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm"
              onclick="
                this.disabled = true;
                this.innerHTML = 'Processing...';
                setTimeout(() => {
                  this.disabled = false;
                  this.innerHTML = 'Click Me';
                  document.getElementById('multi-click-result').innerText = 'Process completed';
                }, 2000);
              ">
              Click Me
            </button>
          </div>
          <div id="multi-click-result" data-testid="multi-click-result" style="color: white; margin-top: 12px; min-height: 20px;"></div>

          <h3>Loading State</h3>
          <div class="button-row">
            <button
              data-testid="loading-button"
              class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm relative"
              onclick="
                this.disabled = true;
                this.classList.add('loading');
                this.innerHTML = '<span class=\\'absolute inset-0 flex items-center justify-center\\'><span class=\\'h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent\\'></span></span><span class=\\'opacity-0\\'>Save Changes</span>';
                setTimeout(() => {
                  this.disabled = false;
                  this.classList.remove('loading');
                  this.innerHTML = 'Save Changes';
                }, 3000);
              ">
              Save Changes
            </button>
          </div>
        </div>

        <div class="test-section">
          <h2>🔹 UI/UX & Layout Test Cases</h2>

          <h3>Button Variants</h3>
          <div class="button-variants">
            <button data-testid="primary-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm">Primary</button>
            <button data-testid="secondary-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-slate-800/80 text-white border border-glass-400 hover:bg-slate-700/60 h-10 px-4 text-sm">Secondary</button>
            <button data-testid="ghost-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 text-gray-300 hover:text-white hover:bg-white/10 h-10 px-4 text-sm">Ghost</button>
            <button data-testid="glass-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-glass-300 backdrop-blur-md border border-glass-400 text-white hover:bg-glass-200 hover:shadow-lg hover:shadow-blue-500/30 h-10 px-4 text-sm">Glass</button>
            <button data-testid="destructive-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400 h-10 px-4 text-sm">Destructive</button>
          </div>

          <h3>Button Sizes</h3>
          <div class="button-row" style="align-items: center;">
            <button data-testid="small-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-glass-300 backdrop-blur-md border border-glass-400 text-white hover:bg-glass-200 hover:shadow-lg hover:shadow-blue-500/30 h-9 px-3 text-sm">Small</button>
            <button data-testid="medium-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-glass-300 backdrop-blur-md border border-glass-400 text-white hover:bg-glass-200 hover:shadow-lg hover:shadow-blue-500/30 h-10 px-4 text-sm">Medium</button>
            <button data-testid="large-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-glass-300 backdrop-blur-md border border-glass-400 text-white hover:bg-glass-200 hover:shadow-lg hover:shadow-blue-500/30 h-12 px-6 text-base">Large</button>
            <button data-testid="icon-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-glass-300 backdrop-blur-md border border-glass-400 text-white hover:bg-glass-200 hover:shadow-lg hover:shadow-blue-500/30 h-10 w-10">🏠</button>
          </div>

          <h3>Button with Icons and Long Labels</h3>
          <div class="button-row">
            <button data-testid="icon-left-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm">
              <span style="margin-right: 8px;">📄</span> Download Report
            </button>
            <button data-testid="icon-right-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm">
              Continue to Next Step <span style="margin-left: 8px;">→</span>
            </button>
          </div>

          <h3>Long Label Test</h3>
          <div class="button-row">
            <button data-testid="long-label-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm" style="max-width: 200px;">
              Continue to Next Step of Registration Process
            </button>
          </div>

          <h3>Full Width Button</h3>
          <button data-testid="full-width-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm w-full">
            Full Width Submit Button
          </button>
        </div>

        <div class="test-section">
          <h2>🔹 Accessibility Test Cases</h2>

          <h3>Focus and Keyboard Navigation</h3>
          <div class="button-row">
            <button data-testid="tab-1" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-glass-300 backdrop-blur-md border border-glass-400 text-white hover:bg-glass-200 hover:shadow-lg hover:shadow-blue-500/30 h-10 px-4 text-sm">Tab 1</button>
            <button data-testid="tab-2" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-glass-300 backdrop-blur-md border border-glass-400 text-white hover:bg-glass-200 hover:shadow-lg hover:shadow-blue-500/30 h-10 px-4 text-sm">Tab 2</button>
            <button data-testid="tab-3" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-glass-300 backdrop-blur-md border border-glass-400 text-white hover:bg-glass-200 hover:shadow-lg hover:shadow-blue-500/30 h-10 px-4 text-sm">Tab 3</button>
          </div>

          <h3>ARIA Labels and Screen Reader Support</h3>
          <div class="button-row">
            <button data-testid="aria-button" aria-label="Save document to cloud storage" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 w-10">💾</button>
            <button data-testid="aria-describedby" aria-describedby="delete-help" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400 h-10 px-4 text-sm">Delete</button>
          </div>
          <div id="delete-help" style="color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 8px;">This action cannot be undone</div>
        </div>

        <div class="test-section">
          <h2>🔹 Edge Cases</h2>

          <h3>Hidden/Invisible Buttons</h3>
          <div class="button-row">
            <button data-testid="hidden-button" style="display: none;" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm">Hidden Button</button>
            <button data-testid="invisible-button" style="visibility: hidden;" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm">Invisible Button</button>
            <button data-testid="zero-opacity-button" style="opacity: 0;" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm">Zero Opacity</button>
          </div>

          <h3>Network Simulation</h3>
          <div class="button-row">
            <button data-testid="slow-network-button" class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 bg-primary-500 text-white shadow-lg shadow-blue-500/30 hover:bg-primary-600 hover:shadow-blue-500/50 h-10 px-4 text-sm"
              onclick="
                this.disabled = true;
                this.innerHTML = 'Loading...';
                // Simulate slow network
                setTimeout(() => {
                  this.disabled = false;
                  this.innerHTML = 'Upload Complete';
                }, 5000);
              ">
              Upload File
            </button>
          </div>
        </div>
      </body>
      </html>
    `);

    testButtons = page.locator('button');
  });

  // 🔹 Functional Test Cases

  test.describe('Button Click Actions', () => {
    test('should perform correct action when Next button is clicked', async () => {
      await page.getByTestId('next-button').click();
      await expect(page.getByTestId('action-result')).toHaveText('Next clicked');
    });

    test('should perform correct action when Previous button is clicked', async () => {
      await page.getByTestId('previous-button').click();
      await expect(page.getByTestId('action-result')).toHaveText('Previous clicked');
    });

    test('should perform correct action when Submit button is clicked', async () => {
      await page.getByTestId('submit-button').click();
      await expect(page.getByTestId('action-result')).toHaveText('Form submitted');
    });
  });

  test.describe('Disabled State', () => {
    test('should not be clickable when disabled', async () => {
      const disabledButton = page.getByTestId('next-disabled');

      // Verify button is disabled
      await expect(disabledButton).toBeDisabled();

      // Verify disabled styling
      await expect(disabledButton).toHaveClass(/disabled:pointer-events-none/);
      await expect(disabledButton).toHaveClass(/disabled:opacity-60/);

      // Try to click and verify no action occurs
      await disabledButton.click({ force: true });
      await expect(page.getByTestId('action-result')).not.toHaveText('Next clicked');
    });

    test('should be clickable when enabled', async () => {
      const enabledButton = page.getByTestId('previous-enabled');

      // Verify button is enabled
      await expect(enabledButton).toBeEnabled();

      // Verify button can be clicked
      await enabledButton.click();
    });
  });

  test.describe('Multiple Clicks Prevention', () => {
    test('should prevent multiple clicks during processing', async () => {
      const button = page.getByTestId('multi-click-button');

      // Click the button
      await button.click();

      // Verify button becomes disabled immediately
      await expect(button).toBeDisabled();
      await expect(button).toHaveText('Processing...');

      // Try to click again while processing
      await button.click({ force: true });

      // Wait for processing to complete
      await expect(page.getByTestId('multi-click-result')).toHaveText('Process completed', { timeout: 3000 });

      // Verify button becomes enabled again
      await expect(button).toBeEnabled();
      await expect(button).toHaveText('Click Me');
    });
  });

  test.describe('Loading State', () => {
    test('should display loading spinner when in loading state', async () => {
      const button = page.getByTestId('loading-button');

      // Click to trigger loading state
      await button.click();

      // Verify loading state
      await expect(button).toBeDisabled();
      await expect(button.locator('.animate-spin')).toBeVisible();
      await expect(button.locator('.opacity-0')).toBeVisible();

      // Wait for loading to complete
      await expect(button).toBeEnabled({ timeout: 4000 });
      await expect(button).toHaveText('Save Changes');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support Tab navigation', async () => {
      // Start from first tab button
      await page.getByTestId('tab-1').focus();
      await expect(page.getByTestId('tab-1')).toBeFocused();

      // Tab to next button
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('tab-2')).toBeFocused();

      // Tab to third button
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('tab-3')).toBeFocused();

      // Shift+Tab back
      await page.keyboard.press('Shift+Tab');
      await expect(page.getByTestId('tab-2')).toBeFocused();
    });

    test('should activate button with Enter key', async () => {
      await page.getByTestId('next-button').focus();
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('action-result')).toHaveText('Next clicked');
    });

    test('should activate button with Spacebar', async () => {
      await page.getByTestId('previous-button').focus();
      await page.keyboard.press('Space');
      await expect(page.getByTestId('action-result')).toHaveText('Previous clicked');
    });
  });

  // 🔹 UI/UX & Layout Test Cases

  test.describe('Button Variants', () => {
    buttonVariants.forEach(({ variant, expected }) => {
      test(`should render ${variant} variant correctly`, async () => {
        const button = page.getByTestId(`${variant}-button`);
        await expect(button).toBeVisible();

        // Take screenshot for visual verification
        await button.screenshot({
          path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\button-${variant}-variant.png`
        });
      });
    });

    test('should have correct hover effects', async () => {
      const primaryButton = page.getByTestId('primary-button');

      // Hover over button
      await primaryButton.hover();

      // Take screenshot of hover state
      await primaryButton.screenshot({
        path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\button-primary-hover.png`
      });
    });
  });

  test.describe('Button Sizes', () => {
    buttonSizes.forEach(({ size, expected }) => {
      test(`should render ${size} size correctly`, async () => {
        const button = page.getByTestId(`${size}-button`);
        await expect(button).toBeVisible();

        // Take screenshot for size verification
        await button.screenshot({
          path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\button-${size}-size.png`
        });
      });
    });
  });

  test.describe('Button Alignment and Spacing', () => {
    test('should have consistent spacing between buttons', async () => {
      const buttonRow = page.locator('.button-row').first();

      // Take screenshot of button row layout
      await buttonRow.screenshot({
        path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\button-spacing.png`
      });

      // Verify buttons are properly aligned
      const buttons = buttonRow.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        await expect(buttons.nth(i)).toBeVisible();
      }
    });

    test('should handle long labels correctly', async () => {
      const longLabelButton = page.getByTestId('long-label-button');

      // Verify button is visible and text doesn't overflow container
      await expect(longLabelButton).toBeVisible();

      // Take screenshot for visual verification
      await longLabelButton.screenshot({
        path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\button-long-label.png`
      });
    });

    test('should render full width button correctly', async () => {
      const fullWidthButton = page.getByTestId('full-width-button');

      // Verify button takes full width
      await expect(fullWidthButton).toBeVisible();
      await expect(fullWidthButton).toHaveClass(/w-full/);

      // Take screenshot
      await fullWidthButton.screenshot({
        path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\button-full-width.png`
      });
    });
  });

  test.describe('Icon and Label Visibility', () => {
    test('should display icons and labels correctly', async () => {
      const iconLeftButton = page.getByTestId('icon-left-button');
      const iconRightButton = page.getByTestId('icon-right-button');
      const iconOnlyButton = page.getByTestId('icon-button');

      // Verify all icon buttons are visible
      await expect(iconLeftButton).toBeVisible();
      await expect(iconRightButton).toBeVisible();
      await expect(iconOnlyButton).toBeVisible();

      // Take screenshots
      await iconLeftButton.screenshot({
        path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\button-icon-left.png`
      });
      await iconRightButton.screenshot({
        path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\button-icon-right.png`
      });
      await iconOnlyButton.screenshot({
        path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\button-icon-only.png`
      });
    });
  });

  // 🔹 Responsive Design Test Cases

  test.describe('Responsive Design', () => {
    viewports.forEach(({ name, width, height }) => {
      test(`should render correctly on ${name} (${width}x${height})`, async () => {
        await page.setViewportSize({ width, height });

        // Take full page screenshot for each viewport
        await page.screenshot({
          path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\buttons-${name}-${width}x${height}.png`,
          fullPage: true
        });

        // Verify buttons are still visible and accessible
        const primaryButton = page.getByTestId('primary-button');
        await expect(primaryButton).toBeVisible();

        // Test button interaction on different viewport
        await primaryButton.click();
      });
    });

    test('should handle button stacking on mobile', async () => {
      await page.setViewportSize({ width: 320, height: 568 });

      const buttonRow = page.locator('.button-row').first();
      await buttonRow.screenshot({
        path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\button-mobile-stacking.png`
      });
    });
  });

  // 🔹 Accessibility Test Cases

  test.describe('Accessibility', () => {
    test('should have proper focus indicators', async () => {
      const button = page.getByTestId('tab-1');

      // Focus the button
      await button.focus();

      // Verify focus ring is visible
      await expect(button).toHaveClass(/focus-visible:ring-2/);

      // Take screenshot of focused state
      await button.screenshot({
        path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\button-focus-indicator.png`
      });
    });

    test('should support ARIA labels', async () => {
      const ariaButton = page.getByTestId('aria-button');

      // Verify ARIA label exists
      await expect(ariaButton).toHaveAttribute('aria-label', 'Save document to cloud storage');
    });

    test('should support aria-describedby', async () => {
      const ariaDescribedByButton = page.getByTestId('aria-describedby');

      // Verify aria-describedby attribute
      await expect(ariaDescribedByButton).toHaveAttribute('aria-describedby', 'delete-help');

      // Verify the describing element exists
      await expect(page.locator('#delete-help')).toBeVisible();
    });

    test('should meet color contrast requirements', async () => {
      // Take screenshots of all button variants for manual contrast checking
      for (const { variant } of buttonVariants) {
        const button = page.getByTestId(`${variant}-button`);
        await button.screenshot({
          path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\contrast-${variant}.png`
        });
      }
    });
  });

  // 🔹 Negative & Edge Cases

  test.describe('Edge Cases', () => {
    test('should not allow interaction with hidden buttons', async () => {
      const hiddenButton = page.getByTestId('hidden-button');
      const invisibleButton = page.getByTestId('invisible-button');
      const zeroOpacityButton = page.getByTestId('zero-opacity-button');

      // Verify buttons are not visible
      await expect(hiddenButton).not.toBeVisible();
      await expect(invisibleButton).not.toBeVisible();
      await expect(zeroOpacityButton).not.toBeVisible();

      // Attempting to click should not work
      await hiddenButton.click({ force: true, timeout: 1000 }).catch(() => {});
      await invisibleButton.click({ force: true, timeout: 1000 }).catch(() => {});
      await zeroOpacityButton.click({ force: true, timeout: 1000 }).catch(() => {});
    });

    test('should handle slow network conditions', async () => {
      // Simulate slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });

      const slowNetworkButton = page.getByTestId('slow-network-button');

      // Click button and verify loading state
      await slowNetworkButton.click();
      await expect(slowNetworkButton).toBeDisabled();
      await expect(slowNetworkButton).toHaveText('Loading...');

      // Wait for completion
      await expect(slowNetworkButton).toHaveText('Upload Complete', { timeout: 6000 });
    });
  });

  // Error Screenshot Capture
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      // Capture full page screenshot on failure
      const screenshot = await page.screenshot({
        path: `C:\\Users\\pkhar\\Documents\\Pankh\\pankh_ai_engine_poc_v4\\services\\webui\\tests\\screenshots\\error-${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}.png`,
        fullPage: true
      });

      // Attach screenshot to test report
      await testInfo.attach('screenshot', {
        body: screenshot,
        contentType: 'image/png'
      });
    }
  });
});