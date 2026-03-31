import {
  Menu,
  type BrowserWindow,
  type MenuItemConstructorOptions,
} from 'electron';
import { ipcChannels } from '@shared/contracts';
import type { Locale, MenuAction } from '@shared/types';

type MenuLabels = {
  file: string;
  new: string;
  open: string;
  save: string;
  saveAs: string;
  exportHtml: string;
  exportPdf: string;
  view: string;
  editorOnly: string;
  splitView: string;
  previewOnly: string;
};

const labels: Record<Locale, MenuLabels> = {
  en: {
    file: 'File',
    new: 'New',
    open: 'Open...',
    save: 'Save',
    saveAs: 'Save As...',
    exportHtml: 'Export HTML...',
    exportPdf: 'Export PDF...',
    view: 'View',
    editorOnly: 'Editor Only',
    splitView: 'Split View',
    previewOnly: 'Preview Only',
  },
  'pt-BR': {
    file: 'Arquivo',
    new: 'Novo',
    open: 'Abrir...',
    save: 'Salvar',
    saveAs: 'Salvar como...',
    exportHtml: 'Exportar HTML...',
    exportPdf: 'Exportar PDF...',
    view: 'Visualização',
    editorOnly: 'Somente Editor',
    splitView: 'Visualização Dividida',
    previewOnly: 'Somente Visualização',
  },
  es: {
    file: 'Archivo',
    new: 'Nuevo',
    open: 'Abrir...',
    save: 'Guardar',
    saveAs: 'Guardar como...',
    exportHtml: 'Exportar HTML...',
    exportPdf: 'Exportar PDF...',
    view: 'Vista',
    editorOnly: 'Solo Editor',
    splitView: 'Vista Dividida',
    previewOnly: 'Solo Vista Previa',
  },
};

function sendAction(window: BrowserWindow, action: MenuAction) {
  window.webContents.send(ipcChannels.menuAction, action);
}

export function createAppMenu(window: BrowserWindow, locale: Locale = 'en') {
  const l = labels[locale] ?? labels.en;
  const isDev = !!process.env.ELECTRON_RENDERER_URL;

  const template: MenuItemConstructorOptions[] = [
    {
      label: l.file,
      submenu: [
        {
          label: l.new,
          accelerator: 'CmdOrCtrl+N',
          click: () => sendAction(window, 'file:new'),
        },
        {
          label: l.open,
          accelerator: 'CmdOrCtrl+O',
          click: () => sendAction(window, 'file:open'),
        },
        { type: 'separator' },
        {
          label: l.save,
          accelerator: 'CmdOrCtrl+S',
          click: () => sendAction(window, 'file:save'),
        },
        {
          label: l.saveAs,
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendAction(window, 'file:save-as'),
        },
        { type: 'separator' },
        {
          label: l.exportHtml,
          accelerator: 'CmdOrCtrl+Alt+H',
          click: () => sendAction(window, 'file:export-html'),
        },
        {
          label: l.exportPdf,
          accelerator: 'CmdOrCtrl+Alt+P',
          click: () => sendAction(window, 'file:export-pdf'),
        },
      ],
    },
    {
      label: l.view,
      submenu: [
        {
          label: l.editorOnly,
          accelerator: 'Alt+1',
          click: () => sendAction(window, 'view:editor'),
        },
        {
          label: l.splitView,
          accelerator: 'Alt+2',
          click: () => sendAction(window, 'view:split'),
        },
        {
          label: l.previewOnly,
          accelerator: 'Alt+3',
          click: () => sendAction(window, 'view:preview'),
        },
      ],
    },
    ...(isDev
      ? [
          {
            label: 'Developer',
            submenu: [
              { role: 'reload' as const, accelerator: 'CmdOrCtrl+R' },
              { role: 'forceReload' as const, accelerator: 'CmdOrCtrl+Shift+R' },
              {
                role: 'toggleDevTools' as const,
                accelerator: 'CmdOrCtrl+Shift+I',
              },
            ],
          },
        ]
      : []),
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
