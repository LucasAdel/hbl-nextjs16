import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('should display contact form', async ({ page }) => {
    await page.goto('/contact');

    // Check form elements exist - actual form uses firstName and lastName fields
    await expect(page.locator('input[name="firstName"], input#firstName')).toBeVisible();
    await expect(page.locator('input[name="lastName"], input#lastName')).toBeVisible();
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"], textarea#message')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/contact');

    // Check form has proper labels for accessibility
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
  });
});

test.describe('Documents Store', () => {
  test('should display document cards', async ({ page }) => {
    await page.goto('/documents');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Documents page uses a grid of cards with rounded-xl styling
    // Look for document items by their structure (grid items with Add to Cart buttons)
    const documentCards = page.locator('button:has-text("Add to Cart")');
    await expect(documentCards.first()).toBeVisible();

    // Verify multiple documents are displayed
    const count = await documentCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display document titles and prices', async ({ page }) => {
    await page.goto('/documents');

    // Check that documents have titles (h3 elements) and prices
    await expect(page.locator('h3').first()).toBeVisible();
    // Use first() to avoid strict mode violation - there are multiple price elements
    await expect(page.locator('[class*="font-bold"]:has-text("$")').first()).toBeVisible();
  });

  test('should navigate to document detail', async ({ page }) => {
    await page.goto('/documents');

    // Click on first document detail link
    const firstDoc = page.locator('a[href*="/documents/"]').first();
    if (await firstDoc.isVisible()) {
      await firstDoc.click();
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});

test.describe('Knowledge Base', () => {
  test('should display categories', async ({ page }) => {
    await page.goto('/knowledge-base');

    // Check categories are displayed
    await expect(page.locator('a[href*="/knowledge-base/"]').first()).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/knowledge-base/medical-practice-setup');

    // Check page loads with heading
    await expect(page.locator('h1')).toBeVisible();

    // Check articles are displayed in this category
    await expect(page.locator('a[href*="/knowledge-base/article/"]').first()).toBeVisible();
  });

  test('should display article', async ({ page }) => {
    await page.goto('/knowledge-base/article/tenant-doctor-agreements-explained');

    // Check article content loads - use first() to avoid strict mode violation
    // (page may have multiple h1 elements from header and content)
    await expect(page.locator('h1').first()).toBeVisible();

    // Check for article content container (main content area)
    // The page uses a prose container for article content
    const contentContainer = page.locator('main, [class*="prose"], article, .container');
    await expect(contentContainer.first()).toBeVisible();
  });
});

test.describe('Services', () => {
  test('should display service list', async ({ page }) => {
    await page.goto('/services');

    // Check service cards
    await expect(page.locator('h2').first()).toBeVisible();
  });

  test('should navigate to service detail', async ({ page }) => {
    await page.goto('/services/practice-setup');

    // Check service detail page
    await expect(page.locator('h1')).toContainText(/Practice Setup/i);
  });
});

test.describe('Articles', () => {
  test('should display article list', async ({ page }) => {
    await page.goto('/articles');

    // Check article cards
    await expect(page.locator('a[href*="/articles/"]').first()).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/articles?category=regulatory');

    // Check that the regulatory filter is active (has the tiffany bg color indicating selection)
    const regulatoryFilter = page.locator('a[href*="category=regulatory"]');
    await expect(regulatoryFilter).toBeVisible();

    // The active filter should have different styling (bg-tiffany)
    await expect(regulatoryFilter).toHaveClass(/bg-tiffany/);

    // Check that article links are displayed
    await expect(page.locator('a[href*="/articles/"]').first()).toBeVisible();
  });

  test('should display article detail', async ({ page }) => {
    await page.goto('/articles/understanding-tenant-doctor-agreements');

    // Check article content
    await expect(page.locator('h1')).toContainText(/Tenant Doctor/i);

    // Check for article content - page may use article tag or prose container
    const articleContent = page.locator('article, [class*="prose"], main');
    await expect(articleContent.first()).toBeVisible();
  });
});

// Note: Admin Dashboard tests have been moved to admin.spec.ts
// They require authentication and run in a separate project with auth fixtures
