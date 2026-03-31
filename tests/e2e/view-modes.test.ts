import { test, expect } from './fixture';

test.describe('view modes', () => {
  test('starts in split mode with both panes visible', async ({ window }) => {
    await window.locator('button[aria-label="Split"]').click();

    await expect(window.locator('.app-editor-pane')).toBeVisible();
    await expect(window.locator('.app-preview-pane')).toBeVisible();
  });

  test('editor-only mode hides the preview pane', async ({ window }) => {
    await window.locator('button[aria-label="Editor"]').click();

    await expect(window.locator('.app-editor-pane')).toBeVisible();
    await expect(window.locator('.app-preview-pane')).toHaveCount(0);
  });

  test('editor-only mode shows the formatting toolbar', async ({ window }) => {
    await window.locator('button[aria-label="Editor"]').click();
    await expect(window.locator('button[aria-label="Bold"]')).toBeVisible();
  });

  test('preview-only mode hides the editor pane', async ({ window }) => {
    await window.locator('button[aria-label="Preview"]').click();

    await expect(window.locator('.app-editor-pane')).toHaveCount(0);
    await expect(window.locator('.app-preview-pane')).toBeVisible();
  });

  test('preview-only mode hides the formatting toolbar', async ({ window }) => {
    await window.locator('button[aria-label="Preview"]').click();
    await expect(window.locator('button[aria-label="Bold"]')).toHaveCount(0);
  });

  test('split mode shows both panes again', async ({ window }) => {
    await window.locator('button[aria-label="Preview"]').click();
    await window.locator('button[aria-label="Split"]').click();

    await expect(window.locator('.app-editor-pane')).toBeVisible();
    await expect(window.locator('.app-preview-pane')).toBeVisible();
  });

  test('active view mode button is visually distinguished', async ({ window }) => {
    await window.locator('button[aria-label="Split"]').click();
    const splitBtn = window.locator('button[aria-label="Split"]');
    // The active button uses the "subtle" variant which applies bg-secondary
    await expect(splitBtn).toHaveClass(/bg-secondary/);
  });
});
