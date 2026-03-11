import { contextBridge, ipcRenderer } from 'electron';
import { ipcChannels, type MarkyApi } from '@shared/contracts';
import type {
  AppSettings,
  ExportPayload,
  Locale,
  MenuAction,
  SaveDocumentPayload,
} from '@shared/types';

const api: MarkyApi = {
  openDocument: () => ipcRenderer.invoke(ipcChannels.openDocument),
  openDocumentFromPath: (path: string) =>
    ipcRenderer.invoke(ipcChannels.openDocumentFromPath, path),
  saveDocument: (payload: SaveDocumentPayload) =>
    ipcRenderer.invoke(ipcChannels.saveDocument, payload),
  saveDocumentAs: (payload: SaveDocumentPayload) =>
    ipcRenderer.invoke(ipcChannels.saveDocumentAs, payload),
  exportHtml: (payload: ExportPayload) =>
    ipcRenderer.invoke(ipcChannels.exportHtml, payload),
  exportPdf: (payload: ExportPayload) =>
    ipcRenderer.invoke(ipcChannels.exportPdf, payload),
  windowMinimize: () => ipcRenderer.send(ipcChannels.windowMinimize),
  windowMaximize: () => ipcRenderer.send(ipcChannels.windowMaximize),
  windowClose: () => ipcRenderer.send(ipcChannels.windowClose),
  windowIsMaximized: () => ipcRenderer.invoke(ipcChannels.windowIsMaximized),
  onMenuAction: (listener: (action: MenuAction) => void) => {
    const subscription = (
      _event: Electron.IpcRendererEvent,
      action: MenuAction,
    ) => listener(action);
    ipcRenderer.on(ipcChannels.menuAction, subscription);

    return () => {
      ipcRenderer.removeListener(ipcChannels.menuAction, subscription);
    };
  },
  getSettings: () => ipcRenderer.invoke(ipcChannels.settingsGet),
  setSettings: (settings: AppSettings) =>
    ipcRenderer.invoke(ipcChannels.settingsSet, settings),
  getLocale: () => ipcRenderer.invoke(ipcChannels.getLocale),
  updateMenuLanguage: (locale: Locale) =>
    ipcRenderer.invoke(ipcChannels.updateMenuLanguage, locale),
};

contextBridge.exposeInMainWorld('marky', api);
