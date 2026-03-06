import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const gitCheck = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
  stdio: 'ignore',
});

if (gitCheck.status !== 0 || !existsSync('.git')) {
  console.log('Skipping Husky install: no git repository detected.');
  process.exit(0);
}

const husky = spawnSync(process.execPath, [resolve('node_modules/husky/bin.js')], {
  cwd: process.cwd(),
  stdio: 'inherit',
});

process.exit(husky.status ?? 0);
