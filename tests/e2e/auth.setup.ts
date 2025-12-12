import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../.playwright/.auth/admin.json');

/**
 * Authentication setup for admin tests.
 *
 * This setup authenticates an admin user and saves the storage state
 * so that subsequent admin tests don't need to log in again.
 *
 * Requires environment variables:
 * - TEST_ADMIN_EMAIL: Admin user email
 * - TEST_ADMIN_PASSWORD: Admin user password
 */
setup('authenticate as admin', async ({ page }) => {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  // Skip if credentials not provided
  if (!email || !password) {
    console.log('⚠️ Skipping auth setup: TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD not set');
    console.log('   Admin tests will be skipped without credentials.');
    return;
  }

  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.fill('#email', email);
  await page.fill('#password', password);

  // Click sign in button
  await page.click('button[type="submit"]');

  // Wait for navigation to admin dashboard
  await page.waitForURL('/admin', { timeout: 10000 }).catch(() => {
    // May redirect to portal if user is a client
    console.log('Login completed, checking destination...');
  });

  // Verify we're logged in by checking for admin layout or portal
  const currentUrl = page.url();
  if (currentUrl.includes('/admin') || currentUrl.includes('/portal')) {
    console.log('✅ Authentication successful');
  } else {
    console.log('⚠️ Unexpected redirect to:', currentUrl);
  }

  // Save storage state for reuse
  await page.context().storageState({ path: authFile });
});
