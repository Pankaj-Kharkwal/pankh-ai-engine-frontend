import { test, expect } from '@playwright/test'

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
