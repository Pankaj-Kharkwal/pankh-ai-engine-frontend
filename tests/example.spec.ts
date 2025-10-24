import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Listen for console errors and log them
  page.on('console', msg => {
    console.log(`Console ${msg.type()}: ${msg.text()}`);
  });

  await page.goto('/', { timeout: 30000 });

  // Wait for JavaScript to load
  await page.waitForLoadState('domcontentloaded');

  // Try to wait for any element to appear, not just React content
  try {
    await page.waitForFunction(() => {
      const root = document.getElementById('root');
      return root && root.children.length > 0;
    }, { timeout: 5000 });
  } catch (error) {
    // If React doesn't render, let's check if assets loaded at least
    console.log('React not rendering, checking if assets loaded');
    const content = await page.content();
    console.log('Page HTML length:', content.length);
  }
});

test('sidebar displays PankhAI logo', async ({ page }) => {
  // Wait for any h1 element to appear (logo should be rendered)
  await page.waitForSelector('h1', { timeout: 10000 });
  // Check if the page has any content indicating successful load
  const hasContent = await page.locator('body').textContent();
  expect(hasContent).toBeTruthy();
  expect(hasContent).toContain('PankhAI');
});

test('navigate to Workflow Builder page', async ({ page }) => {
  // Wait for any navigation link to appear
  await page.waitForSelector('a', { timeout: 10000 });

  // Look for navigation link by text (more robust)
  const workflowLink = page.locator('a:has-text("Workflow Builder")').first();
  await workflowLink.waitFor({ timeout: 10000 });
  await workflowLink.click();

  // Wait for URL change
  await page.waitForURL('**/workflows/create', { timeout: 10000 });

  // Wait for page content to load
  await page.waitForLoadState('networkidle');

  // Check that we're on the right page
  expect(page.url()).toMatch(/\/workflows\/create/);
});
