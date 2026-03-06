import { ensureElectronInstalled, run } from './lib/run';

run('node_modules/typescript/bin/tsc', ['--noEmit', '-p', 'tsconfig.node.json']);
run('node_modules/typescript/bin/tsc', ['--noEmit', '-p', 'tsconfig.web.json']);
ensureElectronInstalled();
run('node_modules/electron-vite/bin/electron-vite.js', ['build']);
