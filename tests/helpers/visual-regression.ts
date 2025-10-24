import { Page, Locator, expect } from '@playwright/test'
import path from 'path'

/**
 * Visual regression testing utilities for UI components
 */
export class VisualRegressionHelper {
  private page: Page
  private screenshotDir: string

  constructor(page: Page) {
    this.page = page
    this.screenshotDir = path.join(__dirname, '..', 'screenshots')
  }

  /**
   * Compare component screenshot with baseline
   */
  async compareComponent(
    locator: Locator,
    name: string,
    options: {
      threshold?: number
      maxDiffPixels?: number
      animations?: 'disabled' | 'allow'
      mask?: Locator[]
      clip?: { x: number; y: number; width: number; height: number }
    } = {}
  ) {
    const {
      threshold = 0.1,
      maxDiffPixels = 100,
      animations = 'disabled',
      mask = [],
      clip,
    } = options

    // Wait for component to be stable
    await locator.waitFor({ state: 'visible' })

    // Disable animations if requested
    if (animations === 'disabled') {
      await this.page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `,
      })
    }

    // Take screenshot and compare
    await expect(locator).toHaveScreenshot(`${name}.png`, {
      threshold,
      maxDiffPixels,
      mask,
      clip,
    })
  }

  /**
   * Compare full page screenshot
   */
  async compareFullPage(
    name: string,
    options: {
      threshold?: number
      maxDiffPixels?: number
      animations?: 'disabled' | 'allow'
      mask?: Locator[]
    } = {}
  ) {
    const { threshold = 0.1, maxDiffPixels = 500, animations = 'disabled', mask = [] } = options

    // Disable animations if requested
    if (animations === 'disabled') {
      await this.page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `,
      })
    }

    // Wait for page to be stable
    await this.page.waitForLoadState('networkidle')

    // Take full page screenshot and compare
    await expect(this.page).toHaveScreenshot(`${name}-fullpage.png`, {
      fullPage: true,
      threshold,
      maxDiffPixels,
      mask,
    })
  }

  /**
   * Compare component states (hover, focus, active, etc.)
   */
  async compareComponentStates(
    locator: Locator,
    name: string,
    states: {
      default?: boolean
      hover?: boolean
      focus?: boolean
      active?: boolean
      disabled?: boolean
    } = { default: true }
  ) {
    // Default state
    if (states.default) {
      await this.compareComponent(locator, `${name}-default`)
    }

    // Hover state
    if (states.hover) {
      await locator.hover()
      await this.page.waitForTimeout(100) // Wait for hover animation
      await this.compareComponent(locator, `${name}-hover`)
    }

    // Focus state
    if (states.focus) {
      await locator.focus()
      await this.page.waitForTimeout(100) // Wait for focus ring
      await this.compareComponent(locator, `${name}-focus`)
    }

    // Active state
    if (states.active) {
      await locator.hover()
      await this.page.mouse.down()
      await this.page.waitForTimeout(100) // Wait for active state
      await this.compareComponent(locator, `${name}-active`)
      await this.page.mouse.up()
    }

    // Disabled state
    if (states.disabled) {
      // Note: This assumes the component can be disabled programmatically
      await this.page.evaluate(
        element => {
          if (element instanceof HTMLButtonElement) {
            element.disabled = true
          }
        },
        await locator.elementHandle()
      )
      await this.compareComponent(locator, `${name}-disabled`)
    }
  }

  /**
   * Compare component across different viewport sizes
   */
  async compareResponsive(
    locator: Locator,
    name: string,
    viewports: Array<{ name: string; width: number; height: number }> = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
    ]
  ) {
    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height })
      await this.page.waitForTimeout(200) // Wait for layout reflow
      await this.compareComponent(
        locator,
        `${name}-${viewport.name}-${viewport.width}x${viewport.height}`
      )
    }
  }

  /**
   * Compare component with different themes
   */
  async compareThemes(
    locator: Locator,
    name: string,
    themes: Array<{ name: string; className: string }> = [
      { name: 'light', className: 'theme-light' },
      { name: 'dark', className: 'theme-dark' },
    ]
  ) {
    for (const theme of themes) {
      // Apply theme class to body
      await this.page.evaluate(className => {
        document.body.className = className
      }, theme.className)

      await this.page.waitForTimeout(100) // Wait for theme to apply
      await this.compareComponent(locator, `${name}-${theme.name}`)
    }
  }

  /**
   * Generate component variant matrix screenshots
   */
  async compareVariantMatrix(
    componentSelector: string,
    name: string,
    variants: {
      [key: string]: string[]
    }
  ) {
    const keys = Object.keys(variants)
    const values = Object.values(variants)

    // Generate all combinations
    const combinations = this.generateCombinations(values)

    for (let i = 0; i < combinations.length; i++) {
      const combination = combinations[i]
      const variantName = keys.map((key, index) => `${key}-${combination[index]}`).join('-')

      // Build selector with variant classes
      const classes = combination.join(' ')
      const selector = `${componentSelector}.${classes.replace(/\s+/g, '.')}`

      try {
        const locator = this.page.locator(selector)
        await this.compareComponent(locator, `${name}-${variantName}`)
      } catch (error) {
        console.warn(`Could not find component with selector: ${selector}`)
      }
    }
  }

  /**
   * Test component loading states
   */
  async compareLoadingStates(locator: Locator, name: string, triggerLoading: () => Promise<void>) {
    // Initial state
    await this.compareComponent(locator, `${name}-initial`)

    // Trigger loading
    await triggerLoading()

    // Loading state
    await this.compareComponent(locator, `${name}-loading`)

    // Wait for loading to complete
    await this.page.waitForTimeout(3000)

    // Final state
    await this.compareComponent(locator, `${name}-complete`)
  }

  /**
   * Helper: Generate all combinations from arrays
   */
  private generateCombinations(arrays: string[][]): string[][] {
    if (arrays.length === 0) return [[]]
    if (arrays.length === 1) return arrays[0].map(item => [item])

    const result: string[][] = []
    const firstArray = arrays[0]
    const restCombinations = this.generateCombinations(arrays.slice(1))

    for (const item of firstArray) {
      for (const combination of restCombinations) {
        result.push([item, ...combination])
      }
    }

    return result
  }

  /**
   * Wait for fonts to load (prevents font loading flicker in screenshots)
   */
  async waitForFonts() {
    await this.page.evaluate(() => {
      return document.fonts.ready
    })
  }

  /**
   * Set consistent test environment
   */
  async setupTestEnvironment() {
    // Disable smooth scrolling
    await this.page.addStyleTag({
      content: `
        html {
          scroll-behavior: auto !important;
        }
      `,
    })

    // Wait for fonts
    await this.waitForFonts()

    // Set consistent date for screenshots (if date is displayed)
    await this.page.addInitScript(() => {
      const constantDate = new Date('2024-01-15T12:00:00.000Z')
      Date.now = () => constantDate.getTime()
      Date.prototype.getTime = () => constantDate.getTime()
    })
  }
}

/**
 * Screenshot comparison options
 */
export interface ScreenshotOptions {
  threshold?: number
  maxDiffPixels?: number
  animations?: 'disabled' | 'allow'
  mask?: Locator[]
  clip?: { x: number; y: number; width: number; height: number }
}

/**
 * Utility functions for visual testing
 */
export class VisualTestUtils {
  /**
   * Create a test page with controlled environment
   */
  static async createTestPage(page: Page) {
    const helper = new VisualRegressionHelper(page)
    await helper.setupTestEnvironment()
    return helper
  }

  /**
   * Standard viewport sizes for responsive testing
   */
  static readonly VIEWPORTS = {
    mobile: { width: 375, height: 667 },
    mobileLarge: { width: 414, height: 896 },
    tablet: { width: 768, height: 1024 },
    tabletLarge: { width: 1024, height: 1366 },
    desktop: { width: 1280, height: 720 },
    desktopLarge: { width: 1920, height: 1080 },
  }

  /**
   * Standard component states for testing
   */
  static readonly COMPONENT_STATES = {
    all: { default: true, hover: true, focus: true, active: true },
    interactive: { default: true, hover: true, focus: true },
    basic: { default: true, hover: true },
    staticOnly: { default: true },
  }

  /**
   * Common button variants for testing
   */
  static readonly BUTTON_VARIANTS = {
    variant: ['primary', 'secondary', 'ghost', 'glass', 'destructive'],
    size: ['sm', 'md', 'lg'],
  }
}
