import { test, expect } from './fixture';

test.describe('app launch', () => {
  test('opens a window', async ({ app }) => {
    const windows = app.windows();
    expect(windows.length).toBeGreaterThanOrEqual(1);
  });

  test('window has correct title', async ({ window }) => {
    const title = await window.title();
    expect(title).toContain('Marky');
  });

  test('loads with the default document content', async ({ window }) => {
    const editor = window.locator('.cm-content');
    const text = await editor.textContent();
    expect(text).toContain('Welcome to Marky');
  });
});
