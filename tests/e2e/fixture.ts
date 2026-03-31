import { test as base, type ElectronApplication, type Page } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

type MarkyFixtures = {
  ensureEnglish: void;
};

type MarkyWorkerFixtures = {
  app: ElectronApplication;
  window: Page;
};

function getMainEntry() {
  // Prefer dev output if it exists (created by electron-vite dev),
  // otherwise fall back to the production build output.
  const devMain = resolve('out/main/index.js');
  if (existsSync(devMain)) return devMain;
  throw new Error(
    'No built output found. Run "npm run dev" or "npm run build" first.',
  );
}

export const test = base.extend<MarkyFixtures, MarkyWorkerFixtures>({
  app: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const app = await electron.launch({
        args: [getMainEntry()],
        env: { ...process.env, MARKY_FORCE_LOCALE: 'en' },
      });
      await use(app);
      await app.close();
    },
    { scope: 'worker' },
  ],

  window: [
    async ({ app }, use) => {
      const window = await app.firstWindow();
      await window.waitForLoadState('domcontentloaded');
      // Wait for React to fully mount before running tests
      await window.locator('header').waitFor({ state: 'visible', timeout: 10_000 });
      await use(window);
    },
    { scope: 'worker' },
  ],

  ensureEnglish: [
    async ({ window }, use) => {
      // Before each test, reset language to English if a prior test changed it
      const needsReset = await window.evaluate(async () => {
        const settings = await window.marky.getSettings();
        return settings.language !== 'en';
      });

      if (needsReset) {
        await window.evaluate(async () => {
          const settings = await window.marky.getSettings();
          await window.marky.setSettings({ ...settings, language: 'en' });
        });
        await window.reload();
        await window.waitForLoadState('domcontentloaded');
        await window.locator('header').waitFor({ state: 'visible', timeout: 10_000 });
      }

      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
