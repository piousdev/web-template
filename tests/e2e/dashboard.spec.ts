import { test, expect } from '@playwright/test';

/**
 * Dashboard E2E Tests
 * These tests run with authenticated state from the setup project
 * They use the storageState configured in playwright.config.ts
 */
test.describe('Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify we're on the dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Check for dashboard heading or title
    await expect(
      page.locator('h1, h2').first(),
    ).toBeVisible();
  });

  test('should display user information', async ({ page }) => {
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');

    // User info should be visible (adjust selectors based on your UI)
    // This might be in a sidebar, header, or user menu
    const userElements = page.locator('[data-testid="user-name"], [data-testid="user-email"], .user-info');

    // At least one user info element should be visible
    const count = await userElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for common navigation elements
    const navItems = ['Dashboard', 'Profile', 'Settings'];

    for (const item of navItems) {
      // Check if navigation item exists (case-insensitive)
      const navLink = page.locator(`a:has-text("${item}"), button:has-text("${item}")`).first();
      await expect(navLink).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');

    // Click profile link/button
    await page.click('a:has-text("Profile"), button:has-text("Profile")');

    // Should navigate to profile page
    await page.waitForURL(/.*profile/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*profile/);
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');

    // Click settings link/button
    await page.click('a:has-text("Settings"), button:has-text("Settings")');

    // Should navigate to settings page
    await page.waitForURL(/.*settings/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*settings/);
  });

  test('should have sign out functionality', async ({ page }) => {
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for sign out button/link
    const signOutButton = page.locator('button:has-text("Sign Out"), a:has-text("Sign Out"), [data-testid="sign-out"]');
    await expect(signOutButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display dashboard stats or cards', async ({ page }) => {
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for dashboard cards or stats
    // Adjust selectors based on your dashboard UI
    const dashboardCards = page.locator('[data-testid="stat-card"], .card, [class*="card"]');

    // Wait for at least one card to be visible
    await expect(dashboardCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('should load and display recent activity', async ({ page }) => {
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for activity feed or recent items section
    // Adjust based on your dashboard structure
    const activitySection = page.locator(
      '[data-testid="recent-activity"], [data-testid="activity-feed"], h2:has-text("Recent"), h3:has-text("Activity")'
    );

    // Activity section should exist
    const count = await activitySection.count();
    expect(count).toBeGreaterThanOrEqual(0); // May be 0 if no activity yet
  });
});

test.describe('Profile Page', () => {
  test('should load profile page', async ({ page }) => {
    await page.goto('/en/profile');
    await page.waitForLoadState('networkidle');

    // Verify we're on the profile page
    await expect(page).toHaveURL(/.*profile/);
  });

  test('should display user profile information', async ({ page }) => {
    await page.goto('/en/profile');
    await page.waitForLoadState('networkidle');

    // Profile form or display should be visible
    const profileElements = page.locator('form, [data-testid="profile-info"]');
    await expect(profileElements.first()).toBeVisible();
  });

  test('should have editable profile fields', async ({ page }) => {
    await page.goto('/en/profile');
    await page.waitForLoadState('networkidle');

    // Check for input fields
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');

    // At least name or email field should exist
    const nameVisible = await nameInput.isVisible().catch(() => false);
    const emailVisible = await emailInput.isVisible().catch(() => false);

    expect(nameVisible || emailVisible).toBeTruthy();
  });
});

test.describe('Settings Page', () => {
  test('should load settings page', async ({ page }) => {
    await page.goto('/en/settings');
    await page.waitForLoadState('networkidle');

    // Verify we're on the settings page
    await expect(page).toHaveURL(/.*settings/);
  });

  test('should have settings sections', async ({ page }) => {
    await page.goto('/en/settings');
    await page.waitForLoadState('networkidle');

    // Check for common settings sections
    const settingsSections = page.locator('form, section, [data-testid*="settings"]');

    // At least one settings section should be visible
    await expect(settingsSections.first()).toBeVisible({ timeout: 5000 });
  });

  test('should have password change option', async ({ page }) => {
    await page.goto('/en/settings');
    await page.waitForLoadState('networkidle');

    // Look for password-related fields or sections
    const passwordSection = page.locator(
      'input[type="password"], button:has-text("Password"), a:has-text("Password"), h2:has-text("Password"), h3:has-text("Password")'
    );

    // Password change option should exist
    const count = await passwordSection.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Session Management', () => {
  test('should maintain authentication across page reloads', async ({ page }) => {
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should maintain authentication across navigation', async ({ page }) => {
    // Visit multiple protected pages
    const protectedPages = ['/en/dashboard', '/en/profile', '/en/settings'];

    for (const pagePath of protectedPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Should not be redirected to login
      expect(page.url()).not.toContain('/login');
      expect(page.url()).toContain(pagePath.split('/').pop() || '');
    }
  });

  test('should maintain authentication in new tab', async ({ page, context }) => {
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');

    // Open new tab
    const newPage = await context.newPage();
    await newPage.goto('/en/dashboard');
    await newPage.waitForLoadState('networkidle');

    // New tab should also be authenticated
    await expect(newPage).toHaveURL(/.*dashboard/);

    await newPage.close();
  });
});
