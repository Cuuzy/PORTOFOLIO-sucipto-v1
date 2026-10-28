import { test, expect } from '@playwright/test';

test.describe('Blog Post Page', () => {
  test('navigating to a blog post increments view count', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    await firstPostLink.waitFor({ state: 'visible', timeout: 15000 });

    const href = await firstPostLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href!);
    await page.waitForLoadState('networkidle');

    const viewCountEl = page.locator('text=/\\d+ views/').first();
    await expect(viewCountEl).toBeVisible({ timeout: 15000 });

    const text = await viewCountEl.textContent();
    const match = text?.match(/(\d[\d,]*)\s*views/);
    expect(match).toBeTruthy();

    const firstViewCount = parseInt(match![1].replace(/,/g, ''), 10);
    expect(firstViewCount).toBeGreaterThan(0);

    await page.reload();
    await page.waitForLoadState('networkidle');

    const viewCountElAfter = page.locator('text=/\\d+ views/').first();
    await expect(viewCountElAfter).toBeVisible({ timeout: 15000 });

    const textAfter = await viewCountElAfter.textContent();
    const matchAfter = textAfter?.match(/(\d[\d,]*)\s*views/);
    expect(matchAfter).toBeTruthy();

    const secondViewCount = parseInt(matchAfter![1].replace(/,/g, ''), 10);
    expect(secondViewCount).toBeGreaterThan(firstViewCount);
  });

  test('blog post page renders title and content', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    await firstPostLink.waitFor({ state: 'visible', timeout: 15000 });

    const href = await firstPostLink.getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('networkidle');

    const title = page.locator('h1').first();
    await expect(title).toBeVisible({ timeout: 15000 });
    await expect(title).not.toBeEmpty();

    const backLink = page.locator('a', { hasText: 'Kembali ke Blog' });
    await expect(backLink).toBeVisible();
  });
});
