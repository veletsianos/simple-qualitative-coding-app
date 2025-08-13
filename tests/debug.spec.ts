import { test, expect } from '@playwright/test';

test('debug page loading', async ({ page }) => {
  // Set up console and error logging first
  const consoleMessages: string[] = [];
  const pageErrors: string[] = [];
  
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    console.log('Console:', msg.type(), msg.text());
  });
  
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log('Page error:', error.message);
  });
  
  // Navigate to the page
  await page.goto('/');
  
  // Wait a bit for the page to load and JavaScript to execute
  await page.waitForTimeout(5000);
  
  // Take a screenshot to see what's happening
  await page.screenshot({ path: 'debug-screenshot.png' });
  
  // Get page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Get page content
  const content = await page.content();
  console.log('Page content length:', content.length);
  console.log('Full content:', content);
  
  // Check if the page has any content
  const body = await page.locator('body').textContent();
  console.log('Body text:', body?.substring(0, 200));
  
  // Check if root div exists
  const rootDiv = page.locator('#root');
  const rootExists = await rootDiv.count();
  console.log('Root div exists:', rootExists > 0);
  
  if (rootExists > 0) {
    const rootContent = await rootDiv.textContent();
    console.log('Root div content:', rootContent?.substring(0, 200));
  }
  
  // Log all console messages and errors
  console.log('All console messages:', consoleMessages);
  console.log('All page errors:', pageErrors);
});