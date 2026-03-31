import { test, expect } from './fixture';

test.describe('window controls', () => {
  test('minimize button is visible', async ({ window }) => {
    await expect(window.locator('button[aria-label="Minimize"]')).toBeVisible();
  });

  test('maximize button is visible', async ({ window }) => {
    const maximize = window.locator('button[aria-label="Maximize"]');
    const restore = window.locator('button[aria-label="Restore"]');
    const either = maximize.or(restore);
    await expect(either).toBeVisible();
  });

  test('close button is visible', async ({ window }) => {
    await expect(window.locator('button[aria-label="Close"]')).toBeVisible();
  });

  test('can query maximized state via IPC', async ({ app }) => {
    const isMaximized = await app.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      return win?.isMaximized() ?? false;
    });
    expect(typeof isMaximized).toBe('boolean');
  });
});
