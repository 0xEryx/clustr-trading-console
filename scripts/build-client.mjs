import { mkdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { build } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const moduleId = String(manifest.name ?? '')

if (!moduleId.startsWith('@clustrai/')) throw new Error('Clustr client bundle requires the @clustrai npm scope')

await mkdir(resolve(root, 'lib'), { recursive: true })

await build({
  entryPoints: [resolve(root, 'src/client/index.js')],
  outfile: resolve(root, 'lib/client.js'),
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  target: 'es2022',
  external: ['react'],
  loader: { '.png': 'dataurl', '.svg': 'dataurl' },
  sourcemap: true,
  banner: {
    js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(moduleId)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports;`,
  },
  footer: {
    js: 'return module.exports; } });',
  },
})
