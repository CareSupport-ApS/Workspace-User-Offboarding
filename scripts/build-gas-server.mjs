import { build } from 'esbuild';

await build({
  entryPoints: ['src/server/index.ts'],
  outfile: 'gas/Code.gs',
  bundle: false,
  format: 'cjs',
  platform: 'node',
  target: 'es2020',
  logLevel: 'info'
});
