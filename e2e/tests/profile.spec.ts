import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test('loads and displays skills section', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const skillsSection = page.locator('text=Skills').first();
    await expect(skillsSection).toBeVisible({ timeout: 15000 });

    const skillBars = page.locator('[class*="rounded-xl"][class*="bg-gradient"]');
    await expect(skillBars.first()).toBeVisible({ timeout: 15000 });
  });

  test('loads and displays projects section', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const projectsSection = page.locator('text=Projects').first();
    await expect(projectsSection).toBeVisible({ timeout: 15000 });

    const projectCards = page.locator('[class*="card"], [class*="Card"]').first();
    await expect(projectCards).toBeVisible({ timeout: 15000 });
  });

  test('profile name and bio are displayed', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });
});
