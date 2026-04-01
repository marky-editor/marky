import { test, expect } from './fixture';

test.describe('editor', () => {
  test('CodeMirror editor is visible', async ({ window }) => {
    await window.locator('button[aria-label="Split"]').click();
    await expect(window.locator('.cm-editor')).toBeVisible();
  });

  test('editor accepts keyboard input', async ({ window }) => {
    await window.locator('button[aria-label="Split"]').click();
    const content = window.locator('.cm-content');
    await content.focus();
    await window.keyboard.press('Control+End');
    await window.keyboard.type('E2E test input');
    const text = await content.textContent();
    expect(text).toContain('E2E test input');
  });
});
