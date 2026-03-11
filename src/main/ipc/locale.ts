import { app, ipcMain, type BrowserWindow } from 'electron';
import { ipcChannels } from '@shared/contracts';
import type { Locale } from '@shared/types';
import { createAppMenu } from '../menu';

export function registerLocaleIpc(getWindow: () => BrowserWindow | null) {
  ipcMain.handle(ipcChannels.getLocale, () => app.getLocale());

  ipcMain.handle(ipcChannels.updateMenuLanguage, (_, locale: Locale) => {
    const win = getWindow();
    if (win) {
      createAppMenu(win, locale);
    }
  });
}
