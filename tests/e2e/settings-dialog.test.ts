import { test, expect } from './fixture';

test.describe('settings dialog', () => {
  test('opens when clicking the settings button', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();
    await expect(window.locator('h2:has-text("Settings")')).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('contains language selector', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();
    // The language select has the current value "en" for English
    const langSelect = window.locator('select').filter({ has: window.locator('option[value="en"]') });
    await expect(langSelect).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('contains theme toggle buttons', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();
    await expect(window.locator('button:has-text("Light")')).toBeVisible();
    await expect(window.locator('button:has-text("Dark")')).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('contains font size selectors', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();
    await expect(
      window.locator('select[aria-label="Editor font size"]'),
    ).toBeVisible();
    await expect(
      window.locator('select[aria-label="Preview font size"]'),
    ).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('contains PDF page size selector', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();
    const dialog = window.locator('.themed-scrollbar');
    await dialog.evaluate((el) => (el.scrollTop = el.scrollHeight));
    await expect(window.locator('text=Page size')).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('contains PDF margin inputs', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();
    const dialog = window.locator('.themed-scrollbar');
    await dialog.evaluate((el) => (el.scrollTop = el.scrollHeight));
    const marginInputs = window.locator('input[type="number"]');
    await expect(marginInputs).toHaveCount(4);
    await window.keyboard.press('Escape');
  });

  test('closes with the close button', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();
    const dialog = window.locator('.fixed.inset-0');
    await expect(window.locator('h2:has-text("Settings")')).toBeVisible();
    // Click the close button inside the dialog, not the window close button
    await dialog.locator('button[aria-label="Close"]').click();
    await expect(window.locator('h2:has-text("Settings")')).toHaveCount(0);
  });

  test('closes with Escape key', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();
    await expect(window.locator('h2:has-text("Settings")')).toBeVisible();
    await window.keyboard.press('Escape');
    await expect(window.locator('h2:has-text("Settings")')).toHaveCount(0);
  });
});
