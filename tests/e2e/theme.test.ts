import { test, expect } from './fixture';

test.describe('theme switching', () => {
  test('can switch to dark theme', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();
    await expect(window.locator('h2:has-text("Settings")')).toBeVisible();

    await window.locator('button:has-text("Dark")').click();
    const isDark = await window.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(isDark).toBe(true);

    // Restore light theme and close
    await window.locator('button:has-text("Light")').click();
    await window.keyboard.press('Escape');
  });

  test('can switch back to light theme', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();
    await window.locator('button:has-text("Dark")').click();
    await window.locator('button:has-text("Light")').click();
    const isDark = await window.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(isDark).toBe(false);
    await window.keyboard.press('Escape');
  });
});
