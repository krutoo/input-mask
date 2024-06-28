import { build, emptyDir } from '@deno/dnt';
import denoJson from '../deno.json' with { type: 'json' };

await emptyDir('./npm');

await build({
  entryPoints: Object.entries(denoJson.exports).map(([name, path]) =>
    name === '.' ? path : { name, path }
  ),
  outDir: './npm',
  shims: {
    deno: false,
  },
  test: false,
  skipSourceOutput: true,
  package: {
    name: denoJson.name,
    version: Deno.args[0] ?? '0.0.0',
    description: 'Set of useful utils for JavaScript/TypeScript projects',
    author: 'Dmitry Petrov',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'git+https://github.com/krutoo/input-mask.git',
    },
    bugs: {
      url: 'https://github.com/krutoo/input-mask/issues',
    },
  },
  compilerOptions: {
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
  },
});

await Deno.copyFile('README.md', './npm/README.md');
await Deno.copyFile('LICENSE', './npm/LICENSE');
