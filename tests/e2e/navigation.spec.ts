import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Hamilton Bailey/);
  });

  test('should navigate to services page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Services');
    await expect(page).toHaveURL(/\/services/);
    await expect(page.locator('h1')).toContainText('Legal Services');
  });

  test('should navigate to service detail page', async ({ page }) => {
    await page.goto('/services');
    await page.click('text=Learn More >> nth=0');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to articles page', async ({ page }) => {
    await page.goto('/articles');
    await expect(page.locator('h1')).toContainText('Articles');
  });

  test('should navigate to article detail', async ({ page }) => {
    await page.goto('/articles');
    await page.click('text=Read more >> nth=0');
    await expect(page.locator('article')).toBeVisible();
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText('Contact');
  });

  test('should navigate to booking page', async ({ page }) => {
    await page.goto('/book-appointment');
    await expect(page.locator('h1')).toContainText(/Book|Consultation|Appointment/i);
  });

  test('should navigate to documents page', async ({ page }) => {
    await page.goto('/documents');
    await expect(page.locator('h1')).toContainText(/Document|Template/i);
  });

  test('should navigate to knowledge base', async ({ page }) => {
    await page.goto('/knowledge-base');
    await expect(page.locator('h1')).toContainText(/Knowledge/i);
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should open mobile menu', async ({ page }) => {
    await page.goto('/');
    // Look for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button:has(svg)').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Check if mobile menu opened
      await expect(page.locator('nav a, [role="navigation"] a')).toBeVisible();
    }
  });
});
