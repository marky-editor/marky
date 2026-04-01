import { net, protocol } from 'electron';
import { resolve, normalize } from 'node:path';
import { stat } from 'node:fs/promises';

export const LOCAL_ASSET_SCHEME = 'local-asset';

function isWithinDirectory(filePath: string, dir: string): boolean {
  const normalizedFile = normalize(filePath);
  const normalizedDir = normalize(dir) + (process.platform === 'win32' ? '\\' : '/');
  return normalizedFile.startsWith(normalizedDir);
}

export function registerLocalAssetProtocol() {
  protocol.handle(LOCAL_ASSET_SCHEME, async (request) => {
    const url = new URL(request.url);

    const baseDir = decodeURIComponent(url.searchParams.get('base') ?? '');
    const relativePath = decodeURIComponent(url.searchParams.get('path') ?? '');

    if (!baseDir || !relativePath) {
      return new Response('Bad request', { status: 400 });
    }

    const resolved = resolve(baseDir, relativePath);

    if (!isWithinDirectory(resolved, baseDir)) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      const fileStat = await stat(resolved);
      if (!fileStat.isFile()) {
        return new Response('Not found', { status: 404 });
      }
    } catch {
      return new Response('Not found', { status: 404 });
    }

    return net.fetch(`file://${resolved}`);
  });
}
