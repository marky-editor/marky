import { test, expect } from './fixture';

test.describe('insert link dialog', () => {
  test('opens when clicking the link toolbar button', async ({ window }) => {
    await window.locator('button[aria-label="Split"]').click();
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Link"]').click();
    await expect(window.locator('h2:has-text("Insert link")')).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('has URL and text inputs', async ({ window }) => {
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Link"]').click();
    await expect(window.locator('input#insert-asset-url')).toBeVisible();
    await expect(window.locator('input#insert-asset-text')).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('URL input is focused by default', async ({ window }) => {
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Link"]').click();
    await expect(window.locator('input#insert-asset-url')).toBeFocused();
    await window.keyboard.press('Escape');
  });

  test('insert button is disabled when URL is empty', async ({ window }) => {
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Link"]').click();
    const urlInput = window.locator('input#insert-asset-url');
    await urlInput.clear();
    await expect(window.locator('button:has-text("Insert")')).toBeDisabled();
    await window.keyboard.press('Escape');
  });

  test('closes with cancel button', async ({ window }) => {
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Link"]').click();
    await window.locator('button:has-text("Cancel")').click();
    await expect(window.locator('h2:has-text("Insert link")')).toHaveCount(0);
  });

  test('closes with Escape key', async ({ window }) => {
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Link"]').click();
    await expect(window.locator('h2:has-text("Insert link")')).toBeVisible();
    await window.keyboard.press('Escape');
    await expect(window.locator('h2:has-text("Insert link")')).toHaveCount(0);
  });
});

test.describe('insert image dialog', () => {
  test('opens when clicking the image toolbar button', async ({ window }) => {
    await window.locator('button[aria-label="Split"]').click();
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Image"]').click();
    await expect(window.locator('h2:has-text("Insert image")')).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('has URL and alt text inputs', async ({ window }) => {
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Image"]').click();
    await expect(window.locator('input#insert-asset-url')).toBeVisible();
    await expect(window.locator('input#insert-asset-text')).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('closes with Escape key', async ({ window }) => {
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Image"]').click();
    await expect(window.locator('h2:has-text("Insert image")')).toBeVisible();
    await window.keyboard.press('Escape');
    await expect(window.locator('h2:has-text("Insert image")')).toHaveCount(0);
  });
});

test.describe('table picker', () => {
  test('opens when clicking the table toolbar button', async ({ window }) => {
    await window.locator('button[aria-label="Split"]').click();
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Table"]').click();
    await expect(window.locator('text=Choose table size')).toBeVisible();
    await window.keyboard.press('Escape');
  });

  test('shows a grid of cells', async ({ window }) => {
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Table"]').click();
    const cells = window.locator('button[aria-label*="Insert"]');
    const count = await cells.count();
    expect(count).toBe(24);
    await window.keyboard.press('Escape');
  });

  test('closes with Escape key', async ({ window }) => {
    await window.locator('.cm-content').focus();
    await window.locator('button[aria-label="Table"]').click();
    await expect(window.locator('text=Choose table size')).toBeVisible();
    await window.keyboard.press('Escape');
    await expect(window.locator('text=Choose table size')).toHaveCount(0);
  });
});
