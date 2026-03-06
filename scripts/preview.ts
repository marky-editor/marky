import { ensureElectronInstalled, run } from './lib/run';

ensureElectronInstalled();
run('node_modules/electron-vite/bin/electron-vite.js', ['preview']);
