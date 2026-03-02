import { build } from 'esbuild';

await build({
  entryPoints: ['src/server/index.ts'],
  outfile: 'gas/Code.gs',
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2019',
  logLevel: 'info'
});
