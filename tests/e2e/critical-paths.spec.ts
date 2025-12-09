import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('should display contact form', async ({ page }) => {
    await page.goto('/contact');

    // Check form elements exist
    await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible();
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('textarea, input[name="message"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

test.describe('Documents Store', () => {
  test('should display document cards', async ({ page }) => {
    await page.goto('/documents');

    // Check document cards are displayed
    await expect(page.locator('[class*="card"], [class*="document"]').first()).toBeVisible();
  });

  test('should navigate to document detail', async ({ page }) => {
    await page.goto('/documents');

    // Click on first document
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

    // Check articles are displayed
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display article', async ({ page }) => {
    await page.goto('/knowledge-base/article/tenant-doctor-agreements-explained');

    // Check article content
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('article, main')).toBeVisible();
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

    // Check filtered results
    await expect(page.locator('h2')).toContainText(/Regulatory/i);
  });

  test('should display article detail', async ({ page }) => {
    await page.goto('/articles/understanding-tenant-doctor-agreements');

    // Check article content
    await expect(page.locator('h1')).toContainText(/Tenant Doctor/i);
    await expect(page.locator('article')).toBeVisible();
  });
});

test.describe('Admin Dashboard', () => {
  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin');

    // Check dashboard elements
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
  });

  test('should display analytics page', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check analytics page loads
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display leads management', async ({ page }) => {
    await page.goto('/admin/leads');

    // Check leads page elements
    await expect(page.locator('h1')).toContainText(/Lead/i);
  });

  test('should display appointments management', async ({ page }) => {
    await page.goto('/admin/appointments');

    // Check appointments page elements
    await expect(page.locator('h1')).toContainText(/Appointment/i);
  });

  test('should display CMS dashboard', async ({ page }) => {
    await page.goto('/admin/cms');

    // Check CMS page elements
    await expect(page.locator('h1')).toContainText(/Content/i);
  });

  test('should display CMS articles page', async ({ page }) => {
    await page.goto('/admin/cms/articles');

    // Check articles management page
    await expect(page.locator('h1')).toContainText(/Articles/i);
  });

  test('should display CMS documents page', async ({ page }) => {
    await page.goto('/admin/cms/documents');

    // Check documents management page
    await expect(page.locator('h1')).toContainText(/Documents/i);
  });
});
