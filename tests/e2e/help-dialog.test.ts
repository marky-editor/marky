import { test, expect } from './fixture';

test.describe('help dialog', () => {
  test('opens when clicking the help button', async ({ window }) => {
    await window.locator('button[aria-label="Keyboard shortcuts"]').click();
    await expect(
      window.locator('h2:has-text("Keyboard Shortcuts")'),
    ).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('lists formatting shortcuts', async ({ window }) => {
    await window.locator('button[aria-label="Keyboard shortcuts"]').click();
    const dialog = window.locator('.fixed.inset-0');
    await expect(dialog.locator('text=Bold')).toBeVisible();
    await expect(dialog.locator('text=Italic')).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('lists file shortcuts', async ({ window }) => {
    await window.locator('button[aria-label="Keyboard shortcuts"]').click();
    const dialog = window.locator('.fixed.inset-0');
    const scrollable = dialog.locator('.themed-scrollbar');
    await scrollable.evaluate((el) => (el.scrollTop = el.scrollHeight));

    // Use a scoped locator to avoid matching the titlebar Save button
    await expect(dialog.locator('span:has-text("Save")').filter({ hasText: /^Save$/ })).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('closes with Escape key', async ({ window }) => {
    await window.locator('button[aria-label="Keyboard shortcuts"]').click();
    await expect(
      window.locator('h2:has-text("Keyboard Shortcuts")'),
    ).toBeVisible();
    await window.keyboard.press('Escape');
    await expect(
      window.locator('h2:has-text("Keyboard Shortcuts")'),
    ).toHaveCount(0);
  });

  test('opens with F1 key', async ({ window }) => {
    await window.keyboard.press('F1');
    await expect(
      window.locator('h2:has-text("Keyboard Shortcuts")'),
    ).toBeVisible();
    await window.keyboard.press('Escape');
  });
});
