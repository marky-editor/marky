import { dialog, ipcMain } from 'electron';
import { basename } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { ipcChannels } from '@shared/contracts';
import type { SaveDocumentPayload } from '@shared/types';

const markdownFilters = [
  { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
];

async function writeDocument(path: string, payload: SaveDocumentPayload) {
  await writeFile(path, payload.content, 'utf8');

  return {
    canceled: false,
    path,
  };
}

export function registerDocumentIpc() {
  ipcMain.handle(ipcChannels.openDocumentFromPath, async (_, path: string) => {
    try {
      const content = await readFile(path, 'utf8');
      return { path, name: basename(path), content };
    } catch {
      return null;
    }
  });

  ipcMain.handle(ipcChannels.openDocument, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: markdownFilters,
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const path = result.filePaths[0];
    const content = await readFile(path, 'utf8');

    return {
      path,
      name: basename(path),
      content,
    };
  });

  ipcMain.handle(
    ipcChannels.saveDocument,
    async (_, payload: SaveDocumentPayload) => {
      if (payload.path) {
        return writeDocument(payload.path, payload);
      }

      const result = await dialog.showSaveDialog({
        defaultPath: payload.suggestedName,
        filters: markdownFilters,
      });

      if (result.canceled || !result.filePath) {
        return { canceled: true, path: null };
      }

      return writeDocument(result.filePath, payload);
    },
  );

  ipcMain.handle(ipcChannels.pickImage, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'bmp', 'ico'],
        },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  ipcMain.handle(
    ipcChannels.saveDocumentAs,
    async (_, payload: SaveDocumentPayload) => {
      const result = await dialog.showSaveDialog({
        defaultPath: payload.suggestedName,
        filters: markdownFilters,
      });

      if (result.canceled || !result.filePath) {
        return { canceled: true, path: null };
      }

      return writeDocument(result.filePath, payload);
    },
  );
}
