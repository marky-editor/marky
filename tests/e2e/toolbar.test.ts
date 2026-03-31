import { test, expect } from './fixture';

test.describe('formatting toolbar', () => {
  const buttons = [
    'Bold',
    'Italic',
    'Strikethrough',
    'Heading 1',
    'Heading 2',
    'Bullets',
    'Ordered',
    'Tasks',
    'Quote',
    'Code block',
    'Link',
    'Image',
    'Table',
  ];

  for (const label of buttons) {
    test(`"${label}" button is visible`, async ({ window }) => {
      await window.locator('button[aria-label="Split"]').click();
      await expect(
        window.locator(`button[aria-label="${label}"]`),
      ).toBeVisible();
    });
  }
});
