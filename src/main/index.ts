import { app, protocol } from 'electron';
import { join } from 'node:path';
import { createAppMenu } from './menu';
import { createMainWindow } from './window';
import { registerDocumentIpc } from './ipc/document';
import { registerExportIpc } from './ipc/export';
import { registerWindowIpc } from './ipc/window';
import { registerSettingsIpc } from './ipc/settings';
import { registerLocaleIpc } from './ipc/locale';
import { LOCAL_ASSET_SCHEME, registerLocalAssetProtocol } from './protocol';

protocol.registerSchemesAsPrivileged([
  { scheme: LOCAL_ASSET_SCHEME, privileges: { supportFetchAPI: true, stream: true } },
]);

let mainWindow: ReturnType<typeof createMainWindow> | null = null;

function loadMainWindow(window: ReturnType<typeof createMainWindow>) {
  if (process.env.ELECTRON_RENDERER_URL) {
    return window.loadURL(process.env.ELECTRON_RENDERER_URL);
  }

  return window.loadFile(join(__dirname, '../renderer/index.html'));
}

async function bootstrap() {
  registerDocumentIpc();
  registerExportIpc();
  registerWindowIpc();
  registerSettingsIpc();
  registerLocaleIpc(() => mainWindow);

  app.whenReady().then(() => {
    registerLocalAssetProtocol();
    mainWindow = createMainWindow();
    createAppMenu(mainWindow);
    void loadMainWindow(mainWindow);

    app.on('activate', () => {
      if (mainWindow === null) {
        mainWindow = createMainWindow();
        createAppMenu(mainWindow);
        void loadMainWindow(mainWindow);
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

void bootstrap();
