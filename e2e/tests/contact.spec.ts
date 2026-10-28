import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('submits contact form and shows success message', async ({ page }) => {
    const nameInput = page.locator('#name');
    await nameInput.waitFor({ state: 'visible', timeout: 15000 });

    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#subject', 'E2E Test Subject');
    await page.fill('#message', 'This is an automated E2E test message.');

    await page.click('button[type="submit"]');

    const successMessage = page.locator('text=Message Sent!');
    await expect(successMessage).toBeVisible({ timeout: 15000 });
  });

  test('contact form shows validation errors for empty required fields', async ({ page }) => {
    const nameInput = page.locator('#name');
    await nameInput.waitFor({ state: 'visible', timeout: 15000 });

    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.click();

    const nameInputEl = page.locator('#name');
    const validationMessage = await nameInputEl.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).toBeTruthy();
  });
});
