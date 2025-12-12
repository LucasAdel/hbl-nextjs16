import { test, expect } from '@playwright/test';

/**
 * Admin Dashboard Tests
 *
 * These tests require authentication. They will only run when:
 * - TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD environment variables are set
 * - The auth.setup.ts has successfully authenticated
 *
 * Run with: TEST_ADMIN_EMAIL=admin@example.com TEST_ADMIN_PASSWORD=password npx playwright test --project=admin
 */

// Skip all tests if auth credentials are not available
const hasAuthCredentials = process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD;

test.describe('Admin Dashboard', () => {
  test.skip(!hasAuthCredentials, 'Skipping admin tests - no auth credentials provided');

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin');

    // Check dashboard elements
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
  });

  test('should display analytics page', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check analytics page loads - look for heading or analytics-specific content
    await expect(page.locator('h1, h2').first()).toBeVisible();
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

    // Check CMS page elements - look for Content or CMS heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display CMS articles page', async ({ page }) => {
    await page.goto('/admin/cms/articles');

    // Check articles management page
    await expect(page.locator('h1')).toContainText(/Article/i);
  });

  test('should display CMS documents page', async ({ page }) => {
    await page.goto('/admin/cms/documents');

    // Check documents management page
    await expect(page.locator('h1')).toContainText(/Document/i);
  });

  test('should display Bailey AI settings', async ({ page }) => {
    await page.goto('/admin/bailey-ai');

    // Check Bailey AI page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display settings page', async ({ page }) => {
    await page.goto('/admin/settings');

    // Check settings page loads
    await expect(page.locator('h1')).toContainText(/Setting/i);
  });
});
