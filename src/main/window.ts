import { BrowserWindow, shell, screen } from 'electron';
import { join } from 'node:path';

export function createMainWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = display.workAreaSize;

  const windowWidth = Math.min(1440, screenWidth - 100);
  const windowHeight = Math.min(900, screenHeight - 100);

  const window = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 1100,
    minHeight: 720,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    backgroundColor: '#f2ede4',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  window.once('ready-to-show', () => {
    window.show();
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  return window;
}
