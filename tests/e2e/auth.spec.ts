import { test, expect } from '@playwright/test';

/**
 * Authentication Flow E2E Tests
 * These tests run without authenticated state to test the authentication flows
 * They use the 'chromium-no-auth' project configured in playwright.config.ts
 */
test.describe('Authentication Flow', () => {
  test.describe('Sign Up', () => {
    test('should allow new user to sign up', async ({ page }) => {
      const testEmail = `test-${Date.now()}@example.com`;

      await page.goto('/en/register');
      await page.waitForLoadState('networkidle');

      // Fill in registration form
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"], input[type="email"]', testEmail);
      await page.fill('input[name="password"], input[type="password"]', 'TestPassword123!');

      // Accept terms if checkbox exists
      const termsCheckbox = page.locator('input[type="checkbox"][name="terms"]');
      if (await termsCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
        await termsCheckbox.check();
      }

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should show error for existing email', async ({ page }) => {
      // Use a known test email that already exists
      const existingEmail = process.env.TEST_USER_EMAIL || 'e2e-test@example.com';

      await page.goto('/en/register');
      await page.waitForLoadState('networkidle');

      // Try to register with existing email
      await page.fill('input[name="name"]', 'Another User');
      await page.fill('input[name="email"], input[type="email"]', existingEmail);
      await page.fill('input[name="password"], input[type="password"]', 'TestPassword123!');

      // Accept terms if checkbox exists
      const termsCheckbox = page.locator('input[type="checkbox"][name="terms"]');
      if (await termsCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
        await termsCheckbox.check();
      }

      // Submit form
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(
        page.locator('text=/email.*already|already.*exists/i'),
      ).toBeVisible({ timeout: 5000 });
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/en/register');
      await page.waitForLoadState('networkidle');

      // Fill in form with weak password
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
      await page.fill('input[name="password"], input[type="password"]', 'weak');

      // Try to submit
      await page.click('button[type="submit"]');

      // Should show password validation error
      await expect(
        page.locator('text=/password.*must|invalid.*password|weak.*password/i'),
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Sign In', () => {
    test('should allow existing user to sign in', async ({ page }) => {
      const testEmail = process.env.TEST_USER_EMAIL || 'e2e-test@example.com';
      const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

      await page.goto('/en/login');
      await page.waitForLoadState('networkidle');

      // Fill in login form
      await page.fill('input[name="email"], input[type="email"]', testEmail);
      await page.fill('input[name="password"], input[type="password"]', testPassword);

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/en/login');
      await page.waitForLoadState('networkidle');

      // Try to sign in with invalid credentials
      await page.fill('input[name="email"], input[type="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"], input[type="password"]', 'WrongPassword123!');

      // Submit form
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(
        page.locator('text=/invalid.*credentials|incorrect.*password|login.*failed/i'),
      ).toBeVisible({ timeout: 5000 });
    });

    test('should redirect to return URL after login', async ({ page }) => {
      const testEmail = process.env.TEST_USER_EMAIL || 'e2e-test@example.com';
      const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

      // Try to access protected route
      await page.goto('/en/profile');

      // Should redirect to login with returnUrl
      await page.waitForURL(/.*login.*returnUrl/);

      // Sign in
      await page.fill('input[name="email"], input[type="email"]', testEmail);
      await page.fill('input[name="password"], input[type="password"]', testPassword);
      await page.click('button[type="submit"]');

      // Should redirect back to profile
      await page.waitForURL(/.*profile/, { timeout: 10000 });
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      const protectedRoutes = ['/en/dashboard', '/en/profile', '/en/settings'];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await page.waitForURL(/.*login/, { timeout: 10000 });
        expect(page.url()).toContain('login');
      }
    });
  });

  test.describe('Password Reset', () => {
    test('should send password reset email', async ({ page }) => {
      const testEmail = process.env.TEST_USER_EMAIL || 'e2e-test@example.com';

      await page.goto('/en/forgot-password');
      await page.waitForLoadState('networkidle');

      // Fill in email
      await page.fill('input[name="email"], input[type="email"]', testEmail);

      // Submit form
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(
        page.locator('text=/email.*sent|check.*email|reset.*link/i'),
      ).toBeVisible({ timeout: 5000 });
    });

    test('should show same message for non-existent email (security)', async ({ page }) => {
      await page.goto('/en/forgot-password');
      await page.waitForLoadState('networkidle');

      // Fill in non-existent email
      await page.fill('input[name="email"], input[type="email"]', 'nonexistent@example.com');

      // Submit form
      await page.click('button[type="submit"]');

      // Should still show success message (don't reveal if email exists)
      await expect(
        page.locator('text=/email.*sent|check.*email|reset.*link/i'),
      ).toBeVisible({ timeout: 5000 });
    });
  });
});
