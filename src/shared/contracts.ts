import type {
  AppSettings,
  DocumentHandle,
  ExportPayload,
  Locale,
  MenuAction,
  SaveDocumentPayload,
  SaveResult,
} from './types';

export const ipcChannels = {
  openDocument: 'document:open',
  openDocumentFromPath: 'document:open-path',
  saveDocument: 'document:save',
  saveDocumentAs: 'document:save-as',
  exportHtml: 'export:html',
  exportPdf: 'export:pdf',
  menuAction: 'menu:action',
  windowMinimize: 'window:minimize',
  windowMaximize: 'window:maximize',
  windowClose: 'window:close',
  windowIsMaximized: 'window:isMaximized',
  settingsGet: 'settings:get',
  settingsSet: 'settings:set',
  getLocale: 'locale:get',
  updateMenuLanguage: 'menu:update-language',
} as const;

export type MarkyApi = {
  openDocument: () => Promise<DocumentHandle | null>;
  openDocumentFromPath: (path: string) => Promise<DocumentHandle | null>;
  saveDocument: (payload: SaveDocumentPayload) => Promise<SaveResult>;
  saveDocumentAs: (payload: SaveDocumentPayload) => Promise<SaveResult>;
  exportHtml: (payload: ExportPayload) => Promise<SaveResult>;
  exportPdf: (payload: ExportPayload) => Promise<SaveResult>;
  onMenuAction: (listener: (action: MenuAction) => void) => () => void;
  windowMinimize: () => void;
  windowMaximize: () => void;
  windowClose: () => void;
  windowIsMaximized: () => Promise<boolean>;
  getSettings: () => Promise<AppSettings>;
  setSettings: (settings: AppSettings) => Promise<void>;
  getLocale: () => Promise<string>;
  updateMenuLanguage: (locale: Locale) => Promise<void>;
};
