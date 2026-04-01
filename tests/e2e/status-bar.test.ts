import { test, expect } from './fixture';

test.describe('document status bar', () => {
  test('shows word count', async ({ window }) => {
    await expect(window.locator('text=/\\d+ words/')).toBeVisible();
  });

  test('shows character count', async ({ window }) => {
    await expect(window.locator('text=/\\d+ characters/')).toBeVisible();
  });
});
