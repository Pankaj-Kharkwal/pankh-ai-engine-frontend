import { test, expect } from '@playwright/test';

test('basic connectivity test', async ({ page }) => {
  console.log('Testing basic connectivity...');

  // Test if we can reach the server at all
  const response = await page.goto('/', { timeout: 10000 });
  console.log('Response status:', response?.status());

  // Get the basic HTML content
  const content = await page.content();
  console.log('Page HTML length:', content.length);
  console.log('Has root div:', content.includes('id="root"'));

  // Basic assertions
  expect(response?.status()).toBe(200);
  expect(content).toContain('id="root"');
});

test('check for JavaScript errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('JS Error:', msg.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
    console.log('Page Error:', error.message);
  });

  await page.goto('/', { timeout: 10000 });

  // Wait a bit for any errors to surface
  await page.waitForTimeout(3000);

  console.log('Total errors found:', errors.length);
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }
});

test('check asset loading', async ({ page }) => {
  const requests: string[] = [];
  const responses: string[] = [];

  page.on('request', request => {
    requests.push(`${request.method()} ${request.url()}`);
  });

  page.on('response', response => {
    responses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/', { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  console.log('Requests made:');
  requests.forEach(req => console.log(' -', req));

  console.log('Responses received:');
  responses.forEach(res => console.log(' -', res));
});