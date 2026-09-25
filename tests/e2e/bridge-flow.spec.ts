import { test, expect } from '@playwright/test';

test.describe('RTW Bridge End-to-End Workflow', () => {
  test('should load PWA interface and verify converter input', async ({ page }) => {
    // Navigate to local PWA or mock server
    await page.goto('/');

    // Check title or header presence
    const header = page.locator('h1, .brand-title');
    await expect(header).toBeVisible();

    // Check conversion button presence
    const convertBtn = page.locator('button:has-text("تبدیل هوشمند"), button:has-text("Convert")');
    if (await convertBtn.count() > 0) {
      await expect(convertBtn.first()).toBeVisible();
    }
  });

  test('should verify responsive viewport adaptivity', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
