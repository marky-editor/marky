import { ipcMain, BrowserWindow } from 'electron';
import { ipcChannels } from '@shared/contracts';

export function registerWindowIpc() {
  ipcMain.on(ipcChannels.windowMinimize, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
  });

  ipcMain.on(ipcChannels.windowMaximize, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  });

  ipcMain.on(ipcChannels.windowClose, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
  });

  ipcMain.handle(ipcChannels.windowIsMaximized, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return window?.isMaximized() ?? false;
  });
}
