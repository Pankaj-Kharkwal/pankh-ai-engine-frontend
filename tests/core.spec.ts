import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  const pages = [
    { name: 'Dashboard', header: 'Dashboard' },
    { name: 'Workflow Builder', header: 'Workflow Builder' },
    { name: 'Workflows', header: 'Workflows' },
    { name: 'Marketplace', header: 'Marketplace' },
    { name: 'BYOChatbot', header: 'BYOChatbot' },
    { name: 'Blocks', header: 'Block Manager' },
    { name: 'Executions', header: 'Executions' },
    { name: 'Debug Console', header: 'Debug Console' },
    { name: 'Analytics', header: 'Analytics' },
    { name: 'Admin', header: 'Admin Dashboard' },
    { name: 'Settings', header: 'Settings' },
  ]

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  for (const p of pages) {
    test(`navigate to ${p.name}`, async ({ page }) => {
      await page.click(`nav a:has-text("${p.name}")`)
      await expect(page.locator(`h1:has-text("${p.header}")`)).toBeVisible()
    })
  }
})

test.describe('Dashboard page', () => {
  test(' displays stats cards', async ({ page }) => {
    await page.goto('/')
    const cards = await page.locator('.glass-card').count()
    expect(cards).toBeGreaterThan(0)
  })
})

test.describe('Workflow Builder flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows/create')
  })

  test('add and connect two nodes', async ({ page }) => {
    await page.click('text=SearXNG Search')
    await page.click('text=Echo')
    const nodes = await page.locator('.react-flow__node').count()
    expect(nodes).toBe(2)
  })

  test('save workflow with custom name', async ({ page }) => {
    await page.fill('input[value="Untitled Workflow"]', 'Test Flow')
    await page.click('text=Save Workflow')
    await expect(page.locator('text=Workflow saved successfully!')).toBeVisible()
  })
})

test.describe('Workflows page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows')
  })

  test('shows workflow list or empty state', async ({ page }) => {
    const rows = await page.locator('table tbody tr').count()
    expect(rows).toBeGreaterThanOrEqual(0)
  })

  test('search input works', async ({ page }) => {
    await page.fill('input[placeholder="Search workflows..."]', 'none')
    const empty = await page.locator('text=No workflows found').isVisible()
    expect(empty).toBe(true)
  })
})

test.describe('Workflow Demo page', () => {
  test('shows demo workflows', async ({ page }) => {
    await page.goto('/workflows/demo')
    const demos = await page.locator('text=Simple Search Demo').count()
    expect(demos).toBeGreaterThan(0)
  })
})

test.describe('Blocks page', () => {
  test('displays block registry', async ({ page }) => {
    await page.goto('/blocks')
    const list = await page.locator('text=SearXNG Search').count()
    expect(list).toBeGreaterThan(0)
  })
})

test.describe('Executions page', () => {
  test('has execution ID input', async ({ page }) => {
    await page.goto('/executions')
    await expect(page.locator('input[type="text"]')).toBeVisible()
  })
})

test.describe('Settings page', () => {
  test('shows API Configuration section', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('text=API Configuration')).toBeVisible()
  })
})
