import { test, expect } from './fixture';

test.describe('preview', () => {
  test('renders markdown as HTML', async ({ window }) => {
    await window.locator('button[aria-label="Split"]').click();
    const preview = window.locator('[data-preview-root]');
    await expect(preview).toBeVisible();
    await expect(preview.locator('h1')).toBeVisible();
  });

  test('renders lists from default document', async ({ window }) => {
    await window.locator('button[aria-label="Split"]').click();
    const preview = window.locator('[data-preview-root]');
    await expect(preview.locator('ul')).toBeVisible();
  });

  test('renders blockquotes from default document', async ({ window }) => {
    await window.locator('button[aria-label="Split"]').click();
    const preview = window.locator('[data-preview-root]');
    await expect(preview.locator('blockquote')).toBeVisible();
  });
});
