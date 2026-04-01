import { test, expect } from './fixture';

test.describe('export dropdown', () => {
  test('opens when clicking the export button', async ({ window }) => {
    await window.locator('button:has-text("Export")').click();
    await expect(window.locator('text=Export as PDF')).toBeVisible();
    await expect(window.locator('text=Export as HTML')).toBeVisible();
    await window.locator('.cm-content').click();
  });

  test('closes when clicking away', async ({ window }) => {
    await window.locator('button:has-text("Export")').click();
    await window.locator('.cm-content').click();
    await expect(window.locator('text=Export as PDF')).toHaveCount(0);
  });
});

test.describe('save dropdown', () => {
  test('has a "Save a copy" option in the dropdown', async ({ window }) => {
    const chevron = window.locator('button[aria-label="More save options"]');
    await chevron.click();
    await expect(window.locator('text=Save a copy')).toBeVisible();
    await window.locator('.cm-content').click();
  });
});
