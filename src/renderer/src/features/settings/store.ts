import { create } from 'zustand';
import { defaultAppSettings } from '@shared/settings';
import type { AppSettings } from '@shared/types';

type SettingsStoreState = {
  settings: AppSettings;
  isOpen: boolean;
  isHelpOpen: boolean;
  setSettings: (settings: AppSettings) => void;
  addRecentFile: (path: string) => AppSettings;
  removeRecentFile: (path: string) => AppSettings;
  clearRecentFiles: () => AppSettings;
  openDialog: () => void;
  closeDialog: () => void;
  openHelp: () => void;
  closeHelp: () => void;
};

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  settings: defaultAppSettings,
  isOpen: false,
  isHelpOpen: false,
  setSettings: (settings) => set({ settings }),
  addRecentFile: (path) => {
    const prev = get().settings.recentFiles;
    const next: AppSettings = {
      ...get().settings,
      recentFiles: [path, ...prev.filter((p) => p !== path)].slice(0, 10),
    };
    set({ settings: next });
    return next;
  },
  removeRecentFile: (path) => {
    const next: AppSettings = {
      ...get().settings,
      recentFiles: get().settings.recentFiles.filter((p) => p !== path),
    };
    set({ settings: next });
    return next;
  },
  clearRecentFiles: () => {
    const next: AppSettings = { ...get().settings, recentFiles: [] };
    set({ settings: next });
    return next;
  },
  openDialog: () => set({ isOpen: true }),
  closeDialog: () => set({ isOpen: false }),
  openHelp: () => set({ isHelpOpen: true }),
  closeHelp: () => set({ isHelpOpen: false }),
}));
