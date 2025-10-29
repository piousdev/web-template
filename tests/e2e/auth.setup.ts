import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

/**
 * Authentication setup for Playwright tests
 * This runs once before all tests and saves the authenticated state
 * to be reused across all test files for better performance
 */
setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/en/login');
  await page.waitForLoadState('networkidle');

  // Create test user credentials
  // In production, you might want to use environment variables
  const testEmail = process.env.TEST_USER_EMAIL || 'e2e-test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

  // Note: You may need to manually create this test user in your database
  // or implement a test user seeding strategy for CI/CD

  // Fill in login form
  await page.fill('input[name="email"], input[type="email"]', testEmail);
  await page.fill('input[name="password"], input[type="password"]', testPassword);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard (authentication success)
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  // Verify we're authenticated by checking for dashboard content
  await expect(page).toHaveURL(/.*dashboard/);

  // Save authentication state
  await page.context().storageState({ path: authFile });

  console.log('✓ Authentication state saved to', authFile);
});
