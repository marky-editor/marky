import { app, ipcMain } from 'electron';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ipcChannels } from '@shared/contracts';
import { defaultAppSettings, mergeAppSettings } from '@shared/settings';
import type { AppSettings } from '@shared/types';

function settingsPath() {
  return join(app.getPath('userData'), 'settings.json');
}

async function readSettings(): Promise<AppSettings> {
  try {
    const raw = await readFile(settingsPath(), 'utf-8');
    return mergeAppSettings(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return defaultAppSettings;
  }
}

export function registerSettingsIpc() {
  ipcMain.handle(ipcChannels.settingsGet, () => readSettings());

  ipcMain.handle(ipcChannels.settingsSet, async (_, settings: AppSettings) => {
    await writeFile(settingsPath(), JSON.stringify(settings, null, 2), 'utf-8');
  });
}
