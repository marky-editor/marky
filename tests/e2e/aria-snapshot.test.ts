import { test, expect } from './fixture';

/**
 * Assertions against the accessibility tree — what a screen reader consumes,
 * rather than the attributes we happened to write. These catch what attribute
 * checks cannot: reading order, nesting, and text announced twice.
 *
 * Note on toMatchAriaSnapshot: it matches the template as a *subset*, so it
 * catches renamed and missing nodes but never extra ones. Duplicate labels are
 * extra nodes, which is why the first test below walks the tree instead.
 *
 * A whole-dialog snapshot is deliberately avoided: the font pickers list
 * locally installed families, so it would pass only on the machine that
 * recorded it.
 */
test.describe('aria snapshots', () => {
  test('no group label is announced twice', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();

    const snapshot = await window.locator('[role="dialog"]').ariaSnapshot();

    // Every labelled group, by accessible name.
    const groups = [...snapshot.matchAll(/- group "([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(groups.length).toBeGreaterThan(0);

    // The same text must not also sit in the tree as loose static text: the
    // group already carries it, so a screen reader would say it, then say it
    // again on entering the group.
    const duplicated = groups.filter((name) => {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`- (?:paragraph|text): ${escaped}\\s*$`, 'm').test(
        snapshot,
      );
    });

    expect(duplicated).toEqual([]);

    await window.keyboard.press('Escape');
  });

  test('settings groups expose their controls', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();

    const themeGroup = window.getByRole('group', {
      name: 'Theme',
      exact: true,
    });
    await expect(themeGroup).toMatchAriaSnapshot(`
      - group "Theme":
        - button "Light"
        - button "Dark"
    `);

    const colorGroup = window.getByRole('group', { name: 'Color theme' });
    await expect(colorGroup).toMatchAriaSnapshot(`
      - group "Color theme":
        - button "Amethyst"
        - button "Rose"
        - button "Jade"
        - button "Amber"
        - button "Coral"
        - button "Sapphire"
    `);

    await window.keyboard.press('Escape');
  });

  test('margin inputs are spinbuttons with names', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();

    const margins = window.getByRole('group', { name: 'PDF margins' });
    await expect(margins).toMatchAriaSnapshot(`
      - group "PDF margins (mm)":
        - spinbutton "Top"
        - spinbutton "Right"
        - spinbutton "Bottom"
        - spinbutton "Left"
    `);

    await window.keyboard.press('Escape');
  });

  test('help dialog exposes named sections', async ({ window }) => {
    await window.locator('button[aria-label="Keyboard shortcuts"]').click();

    // Table navigation only: the other sections print modifier keys, which
    // differ between Windows and macOS.
    await expect(window.locator('[role="dialog"]')).toMatchAriaSnapshot(`
      - dialog "Keyboard Shortcuts":
        - heading "Keyboard Shortcuts" [level=2]
        - button "Close"
        - heading "Table Navigation" [level=3]
    `);

    await window.keyboard.press('Escape');
  });
});
