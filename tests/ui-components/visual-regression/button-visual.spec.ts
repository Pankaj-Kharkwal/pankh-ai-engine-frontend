import { test, expect } from '@playwright/test'
import { VisualRegressionHelper, VisualTestUtils } from '../../helpers/visual-regression'

test.describe('Button Visual Regression Tests', () => {
  let visualHelper: VisualRegressionHelper

  test.beforeEach(async ({ page }) => {
    visualHelper = await VisualTestUtils.createTestPage(page)

    // Create a minimal test page with button components
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Button Visual Regression Test</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          /* Button component styles */
          .btn-base {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.5rem;
            font-weight: 500;
            transition: all 0.2s;
            outline: none;
            border: none;
            cursor: pointer;
          }

          .btn-base:focus-visible {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }

          .btn-base:disabled {
            pointer-events: none;
            opacity: 0.6;
          }

          /* Variants */
          .btn-primary {
            background-color: #3b82f6;
            color: white;
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
          }

          .btn-primary:hover {
            background-color: #2563eb;
            box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.5);
          }

          .btn-secondary {
            background-color: rgba(30, 41, 59, 0.8);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .btn-secondary:hover {
            background-color: rgba(51, 65, 85, 0.6);
          }

          .btn-ghost {
            color: #d1d5db;
            background-color: transparent;
          }

          .btn-ghost:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.1);
          }

          .btn-glass {
            background-color: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
          }

          .btn-glass:hover {
            background-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
          }

          .btn-destructive {
            background-color: #ef4444;
            color: white;
          }

          .btn-destructive:hover {
            background-color: #dc2626;
          }

          /* Sizes */
          .btn-sm {
            height: 2.25rem;
            padding: 0 0.75rem;
            font-size: 0.875rem;
          }

          .btn-md {
            height: 2.5rem;
            padding: 0 1rem;
            font-size: 0.875rem;
          }

          .btn-lg {
            height: 3rem;
            padding: 0 1.5rem;
            font-size: 1rem;
          }

          .btn-icon {
            height: 2.5rem;
            width: 2.5rem;
          }

          /* Loading state */
          .btn-loading {
            position: relative;
          }

          .btn-loading .btn-content {
            opacity: 0;
          }

          .btn-loading .spinner {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .spinner-icon {
            height: 1rem;
            width: 1rem;
            animation: spin 1s linear infinite;
            border: 2px solid rgba(255, 255, 255, 0.4);
            border-top-color: transparent;
            border-radius: 50%;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .test-section {
            margin-bottom: 2rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            backdrop-filter: blur(10px);
          }

          .variant-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
          }

          .size-row {
            display: flex;
            gap: 1rem;
            align-items: center;
            margin: 1rem 0;
          }

          h2 { color: white; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <!-- Button Variants -->
        <div class="test-section">
          <h2>Button Variants</h2>
          <div class="variant-grid">
            <button data-testid="btn-primary" class="btn-base btn-primary btn-md">Primary</button>
            <button data-testid="btn-secondary" class="btn-base btn-secondary btn-md">Secondary</button>
            <button data-testid="btn-ghost" class="btn-base btn-ghost btn-md">Ghost</button>
            <button data-testid="btn-glass" class="btn-base btn-glass btn-md">Glass</button>
            <button data-testid="btn-destructive" class="btn-base btn-destructive btn-md">Destructive</button>
          </div>
        </div>

        <!-- Button Sizes -->
        <div class="test-section">
          <h2>Button Sizes</h2>
          <div class="size-row">
            <button data-testid="btn-sm" class="btn-base btn-glass btn-sm">Small</button>
            <button data-testid="btn-md" class="btn-base btn-glass btn-md">Medium</button>
            <button data-testid="btn-lg" class="btn-base btn-glass btn-lg">Large</button>
            <button data-testid="btn-icon" class="btn-base btn-glass btn-icon">🏠</button>
          </div>
        </div>

        <!-- Button States -->
        <div class="test-section">
          <h2>Button States</h2>
          <div class="size-row">
            <button data-testid="btn-normal" class="btn-base btn-primary btn-md">Normal</button>
            <button data-testid="btn-disabled" class="btn-base btn-primary btn-md" disabled>Disabled</button>
            <button data-testid="btn-loading" class="btn-base btn-primary btn-md btn-loading">
              <span class="btn-content">Loading</span>
              <span class="spinner">
                <span class="spinner-icon"></span>
              </span>
            </button>
          </div>
        </div>

        <!-- Interactive Elements -->
        <div class="test-section">
          <h2>Interactive Elements</h2>
          <div class="size-row">
            <button data-testid="btn-hover-test" class="btn-base btn-primary btn-md">Hover Me</button>
            <button data-testid="btn-focus-test" class="btn-base btn-secondary btn-md">Focus Me</button>
            <button data-testid="btn-active-test" class="btn-base btn-glass btn-md">Click Me</button>
          </div>
        </div>

        <!-- Icon Buttons -->
        <div class="test-section">
          <h2>Icon Buttons</h2>
          <div class="size-row">
            <button data-testid="btn-icon-left" class="btn-base btn-primary btn-md">
              <span style="margin-right: 0.5rem;">📄</span> Download
            </button>
            <button data-testid="btn-icon-right" class="btn-base btn-primary btn-md">
              Upload <span style="margin-left: 0.5rem;">📤</span>
            </button>
            <button data-testid="btn-icon-only" class="btn-base btn-glass btn-icon">⚙️</button>
          </div>
        </div>

        <!-- Long Text Buttons -->
        <div class="test-section">
          <h2>Text Overflow Handling</h2>
          <div class="size-row">
            <button data-testid="btn-long-text" class="btn-base btn-primary btn-md" style="max-width: 200px;">
              Continue to Next Step of Registration Process
            </button>
            <button data-testid="btn-very-long" class="btn-base btn-secondary btn-md" style="max-width: 150px;">
              This is an extremely long button text that should handle overflow gracefully
            </button>
          </div>
        </div>
      </body>
      </html>
    `)

    // Wait for page to be stable
    await page.waitForLoadState('networkidle')
  })

  test.describe('Button Variant Screenshots', () => {
    test('should capture all button variants', async () => {
      const variants = ['primary', 'secondary', 'ghost', 'glass', 'destructive']

      for (const variant of variants) {
        const button = page.getByTestId(`btn-${variant}`)
        await visualHelper.compareComponent(button, `button-${variant}-default`)
      }
    })

    test('should capture button variants with hover states', async () => {
      const variants = ['primary', 'secondary', 'ghost', 'glass', 'destructive']

      for (const variant of variants) {
        const button = page.getByTestId(`btn-${variant}`)
        await visualHelper.compareComponentStates(button, `button-${variant}`, {
          default: true,
          hover: true,
        })
      }
    })
  })

  test.describe('Button Size Screenshots', () => {
    test('should capture all button sizes', async () => {
      const sizes = ['sm', 'md', 'lg', 'icon']

      for (const size of sizes) {
        const button = page.getByTestId(`btn-${size}`)
        await visualHelper.compareComponent(button, `button-size-${size}`)
      }
    })

    test('should capture size comparison', async () => {
      const sizeSection = page.locator('.test-section').nth(1)
      await visualHelper.compareComponent(sizeSection, 'button-sizes-comparison')
    })
  })

  test.describe('Button State Screenshots', () => {
    test('should capture button states', async () => {
      // Normal state
      const normalButton = page.getByTestId('btn-normal')
      await visualHelper.compareComponent(normalButton, 'button-state-normal')

      // Disabled state
      const disabledButton = page.getByTestId('btn-disabled')
      await visualHelper.compareComponent(disabledButton, 'button-state-disabled')

      // Loading state
      const loadingButton = page.getByTestId('btn-loading')
      await visualHelper.compareComponent(loadingButton, 'button-state-loading')
    })

    test('should capture all interactive states', async () => {
      const hoverButton = page.getByTestId('btn-hover-test')
      await visualHelper.compareComponentStates(hoverButton, 'button-interactive', {
        default: true,
        hover: true,
        focus: true,
        active: true,
      })
    })
  })

  test.describe('Responsive Button Screenshots', () => {
    test('should capture buttons across different viewports', async () => {
      const button = page.getByTestId('btn-primary')

      await visualHelper.compareResponsive(button, 'button-responsive', [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1280, height: 720 },
      ])
    })

    test('should capture full page layout on different viewports', async () => {
      const viewports = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1280, height: 720 },
      ]

      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        await page.waitForTimeout(200)
        await visualHelper.compareFullPage(`buttons-layout-${viewport.name}`)
      }
    })
  })

  test.describe('Icon Button Screenshots', () => {
    test('should capture icon button variations', async () => {
      const iconButtons = ['icon-left', 'icon-right', 'icon-only']

      for (const iconButton of iconButtons) {
        const button = page.getByTestId(`btn-${iconButton}`)
        await visualHelper.compareComponent(button, `button-${iconButton}`)
      }
    })
  })

  test.describe('Text Overflow Screenshots', () => {
    test('should capture text overflow handling', async () => {
      const longTextButton = page.getByTestId('btn-long-text')
      await visualHelper.compareComponent(longTextButton, 'button-long-text')

      const veryLongButton = page.getByTestId('btn-very-long')
      await visualHelper.compareComponent(veryLongButton, 'button-very-long-text')
    })
  })

  test.describe('Button Focus and Accessibility', () => {
    test('should capture focus indicators', async () => {
      const focusButton = page.getByTestId('btn-focus-test')

      // Default state
      await visualHelper.compareComponent(focusButton, 'button-focus-default')

      // Focused state
      await focusButton.focus()
      await page.waitForTimeout(100)
      await visualHelper.compareComponent(focusButton, 'button-focus-focused')
    })

    test('should capture keyboard navigation sequence', async () => {
      // Take screenshot of initial state
      await visualHelper.compareFullPage('keyboard-nav-initial')

      // Tab through buttons and capture each focus state
      const buttons = ['btn-normal', 'btn-disabled', 'btn-loading']

      for (let i = 0; i < buttons.length; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(100)
        await visualHelper.compareFullPage(`keyboard-nav-step-${i + 1}`)
      }
    })
  })

  test.describe('Theme Variations', () => {
    test('should capture buttons in different theme contexts', async () => {
      const button = page.getByTestId('btn-primary')

      // Default theme (current gradient background)
      await visualHelper.compareComponent(button, 'button-theme-default')

      // Light background theme
      await page.addStyleTag({
        content: `
          body {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%) !important;
          }
        `,
      })
      await page.waitForTimeout(100)
      await visualHelper.compareComponent(button, 'button-theme-light')

      // Dark background theme
      await page.addStyleTag({
        content: `
          body {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
          }
        `,
      })
      await page.waitForTimeout(100)
      await visualHelper.compareComponent(button, 'button-theme-dark')
    })
  })

  test.describe('Performance and Loading States', () => {
    test('should capture loading animation sequence', async () => {
      const loadingButton = page.getByTestId('btn-loading')

      // Capture multiple frames of the loading animation
      for (let i = 0; i < 5; i++) {
        await visualHelper.compareComponent(loadingButton, `button-loading-frame-${i}`)
        await page.waitForTimeout(200)
      }
    })
  })

  test.describe('Edge Cases', () => {
    test('should capture buttons with extreme content', async () => {
      // Add buttons with edge case content
      await page.evaluate(() => {
        const testSection = document.querySelector('.test-section:last-child')
        if (testSection) {
          testSection.innerHTML += `
            <div class="size-row" style="margin-top: 1rem;">
              <button data-testid="btn-empty" class="btn-base btn-primary btn-md"></button>
              <button data-testid="btn-single-char" class="btn-base btn-primary btn-md">A</button>
              <button data-testid="btn-numbers" class="btn-base btn-primary btn-md">1234567890</button>
              <button data-testid="btn-special-chars" class="btn-base btn-primary btn-md">!@#$%^&*()</button>
            </div>
          `
        }
      })

      const edgeCases = ['empty', 'single-char', 'numbers', 'special-chars']

      for (const testCase of edgeCases) {
        const button = page.getByTestId(`btn-${testCase}`)
        await visualHelper.compareComponent(button, `button-edge-${testCase}`)
      }
    })
  })
})
