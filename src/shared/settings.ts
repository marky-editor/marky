import type { AppSettings } from './types';

export const defaultAppSettings: AppSettings = {
  theme: 'light',
  language: 'en',
  exportFont: 'system',
  editorFontFamily: 'IBM Plex Mono',
  editorFontSize: 16,
  previewFontFamily: 'IBM Plex Sans',
  previewFontSize: 16,
  pdfPageSize: 'A4',
  pdfMargins: { top: 20, right: 20, bottom: 20, left: 20 },
  recentFiles: [],
};

export function mergeAppSettings(
  settings: Partial<AppSettings> | null | undefined,
): AppSettings {
  return {
    ...defaultAppSettings,
    ...settings,
    pdfMargins: {
      ...defaultAppSettings.pdfMargins,
      ...settings?.pdfMargins,
    },
    recentFiles: settings?.recentFiles ?? defaultAppSettings.recentFiles,
  };
}
