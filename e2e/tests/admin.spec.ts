import { test, expect } from '@playwright/test';

test.describe('Admin Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
  });

  test('admin login page renders correctly', async ({ page }) => {
    await expect(page.locator('text=Admin Login')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('successful login redirects to admin dashboard', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');

    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/admin/dashboard');
  });

  test('failed login shows error toast', async ({ page }) => {
    await page.fill('#username', 'wronguser');
    await page.fill('#password', 'wrongpassword');

    await page.click('button[type="submit"]');

    const errorToast = page.locator('text=Login failed');
    await expect(errorToast).toBeVisible({ timeout: 10000 });
  });

  test('back to profile link navigates to home', async ({ page }) => {
    const backLink = page.locator('a', { hasText: 'Back to Profile' });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL('/');
  });
});
