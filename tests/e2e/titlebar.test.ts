import { test, expect } from './fixture';

test.describe('titlebar', () => {
  test('displays the document name', async ({ window }) => {
    const header = window.locator('header');
    const text = await header.textContent();
    expect(text?.toLowerCase()).toContain('untitled');
  });

  test('settings button is visible', async ({ window }) => {
    await expect(window.locator('button[aria-label="Settings"]')).toBeVisible();
  });

  test('help button is visible', async ({ window }) => {
    await expect(
      window.locator('button[aria-label="Keyboard shortcuts"]'),
    ).toBeVisible();
  });

  test('save button is visible', async ({ window }) => {
    await expect(window.locator('button:has-text("Save")')).toBeVisible();
  });

  test('open button is visible', async ({ window }) => {
    await expect(window.locator('button:has-text("Open")')).toBeVisible();
  });

  test('export button is visible', async ({ window }) => {
    await expect(window.locator('button:has-text("Export")')).toBeVisible();
  });
});
