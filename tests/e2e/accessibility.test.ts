import type { Page } from '@playwright/test';
import { test, expect } from './fixture';

/** Accessible name of an element, resolved the way assistive tech would. */
async function accessibleName(window: Page, selector: string) {
  return window.evaluate((sel: string) => {
    const element = document.querySelector(sel);
    if (!element) return null;

    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      return document.getElementById(labelledBy)?.textContent?.trim() ?? null;
    }

    const label = element.getAttribute('aria-label');
    if (label) return label;

    const id = element.getAttribute('id');
    if (id) {
      const bound = document.querySelector(`label[for="${id}"]`);
      if (bound) return bound.textContent?.trim() ?? null;
    }

    return null;
  }, selector);
}

test.describe('accessibility', () => {
  test('editor and preview are named landmarks', async ({ window }) => {
    expect(await accessibleName(window, '.app-editor-pane')).toBe('Editor');
    expect(await accessibleName(window, '.app-preview-pane')).toBe('Preview');
  });

  test('document language tracks the active locale', async ({ window }) => {
    await expect
      .poll(() => window.evaluate(() => document.documentElement.lang))
      .toBe('en');

    // Asserting 'en' alone proves nothing: index.html already ships lang="en".
    // The regression is the attribute never changing, so switch and re-check.
    await window.evaluate(async () => {
      const settings = await window.marky.getSettings();
      await window.marky.setSettings({ ...settings, language: 'pt-BR' });
    });

    // setSettings persists over IPC; the running renderer only picks the new
    // locale up on bootstrap, which is why the fixture reloads too.
    await window.reload();
    await window.waitForLoadState('domcontentloaded');
    await window.locator('header').waitFor({ state: 'visible' });

    await expect
      .poll(() => window.evaluate(() => document.documentElement.lang))
      .toBe('pt-BR');
  });

  test('status notices live in an announced region', async ({ window }) => {
    const region = window.locator('footer [role="status"]');
    await expect(region).toHaveCount(1);
    await expect(region).toHaveAttribute('aria-live', 'polite');
  });

  test('dialog exposes modal semantics and a name', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();

    const dialog = window.locator('[role="dialog"]');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(await accessibleName(window, '[role="dialog"]')).toBe('Settings');

    await window.keyboard.press('Escape');
  });

  test('every settings control has an accessible name', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();

    const unnamed = await window.evaluate(() => {
      const panel = document.querySelector('[role="dialog"]');
      if (!panel) return ['no dialog'];

      return Array.from(
        panel.querySelectorAll('select, input, textarea'),
      ).flatMap((control) => {
        const id = control.getAttribute('id');
        const named =
          control.getAttribute('aria-label') ||
          control.getAttribute('aria-labelledby') ||
          (id && document.querySelector(`label[for="${id}"]`));

        return named ? [] : [control.tagName + (id ? `#${id}` : ' (no id)')];
      });
    });

    expect(unnamed).toEqual([]);
    await window.keyboard.press('Escape');
  });

  test('control groups carry their label', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();

    const groups = await window.evaluate(() =>
      Array.from(document.querySelectorAll('[role="group"]')).map((group) => {
        const id = group.getAttribute('aria-labelledby');
        return id
          ? (document.getElementById(id)?.textContent?.trim() ?? null)
          : null;
      }),
    );

    expect(groups).not.toContain(null);
    expect(groups).toContain('Theme');
    expect(groups).toContain('Color theme');

    await window.keyboard.press('Escape');
  });

  test('theme buttons expose pressed state', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();

    // Scoped to the light/dark group specifically. The colour theme buttons
    // already set aria-pressed, so an unscoped query passes either way.
    const themeGroup = window.locator(
      '[role="group"][aria-labelledby="settings-theme-label"]',
    );
    await expect(themeGroup.locator('button')).toHaveCount(2);
    await expect(themeGroup.locator('button[aria-pressed="true"]')).toHaveCount(
      1,
    );

    await window.keyboard.press('Escape');
  });

  test('tab stays inside an open dialog', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();

    for (let i = 0; i < 40; i++) {
      await window.keyboard.press('Tab');
      const inside = await window.evaluate(() => {
        const panel = document.querySelector('[role="dialog"]');
        return panel ? panel.contains(document.activeElement) : false;
      });
      expect(inside).toBe(true);
    }

    await window.keyboard.press('Escape');
  });

  test('closing settings hands focus to the editor', async ({ window }) => {
    await window.locator('button[aria-label="Settings"]').click();
    await expect(window.locator('[role="dialog"]')).toBeVisible();

    await window.keyboard.press('Escape');

    // App deliberately focuses the editor when settings or help close, and its
    // rAF runs after the modal's restore. What matters is that focus is never
    // dropped on <body>, which is where it landed before.
    await expect
      .poll(() =>
        window.evaluate(() => document.activeElement?.className ?? ''),
      )
      .toContain('cm-content');
  });

  test('cancelling the insert dialog restores the trigger', async ({
    window,
  }) => {
    // No App-level focus handling for this one, so the modal's own restore is
    // the only thing keeping focus off <body>.
    await window.locator('button[aria-label="Split"]').click();
    await window.locator('button[aria-label="Link"]').click();
    await expect(window.locator('[role="dialog"]')).toBeVisible();

    await window.keyboard.press('Escape');

    await expect
      .poll(() =>
        window.evaluate(
          () => document.activeElement?.getAttribute('aria-label') ?? null,
        ),
      )
      .toBe('Link');
  });
});
