import {
  Menu,
  type BrowserWindow,
  type MenuItemConstructorOptions,
} from 'electron';
import { ipcChannels } from '@shared/contracts';
import type { MenuAction } from '@shared/types';

function sendAction(window: BrowserWindow, action: MenuAction) {
  window.webContents.send(ipcChannels.menuAction, action);
}

export function createAppMenu(window: BrowserWindow) {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendAction(window, 'file:new'),
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendAction(window, 'file:open'),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendAction(window, 'file:save'),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendAction(window, 'file:save-as'),
        },
        { type: 'separator' },
        {
          label: 'Export HTML...',
          accelerator: 'CmdOrCtrl+Alt+H',
          click: () => sendAction(window, 'file:export-html'),
        },
        {
          label: 'Export PDF...',
          accelerator: 'CmdOrCtrl+Alt+P',
          click: () => sendAction(window, 'file:export-pdf'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Editor Only',
          accelerator: 'Alt+1',
          click: () => sendAction(window, 'view:editor'),
        },
        {
          label: 'Split View',
          accelerator: 'Alt+2',
          click: () => sendAction(window, 'view:split'),
        },
        {
          label: 'Preview Only',
          accelerator: 'Alt+3',
          click: () => sendAction(window, 'view:preview'),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
