import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function electronExecutableName() {
  switch (process.platform) {
    case 'win32':
      return 'electron.exe';
    case 'darwin':
      return join('Electron.app', 'Contents', 'MacOS', 'Electron');
    default:
      return 'electron';
  }
}

export function electronBinaryExists() {
  const pathFile = resolve('node_modules/electron/path.txt');
  const distPath = resolve('node_modules/electron/dist');

  if (existsSync(pathFile)) {
    const relativeBinaryPath = readFileSync(pathFile, 'utf8').trim();
    return existsSync(join(distPath, relativeBinaryPath));
  }

  return existsSync(join(distPath, electronExecutableName()));
}

export function run(scriptPath: string, args: string[] = []) {
  const result = spawnSync(process.execPath, [resolve(scriptPath), ...args], {
    cwd: process.cwd(),
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

export function ensureElectronInstalled() {
  if (electronBinaryExists()) {
    return;
  }

  console.log('Electron binary missing. Running Electron install script...');
  run('node_modules/electron/install.js');
}
