import { build } from 'vite';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { renderApplicationRoute } from '../server.mjs';

await build();
await build({ build: { ssr: 'src/entry-server.jsx', outDir: 'dist/server', emptyOutDir: false } });
const { render } = await import('../dist/server/entry-server.js');
const fonts = (await readdir('dist/assets')).filter(name => /^(newsreader|geist)-latin-wght-normal-.*\.woff2$/.test(name));
const fontPreloads = fonts.map(name => `<link rel="preload" href="/assets/${name}" as="font" type="font/woff2" crossorigin>`).join('\n');
const template = (await readFile('dist/index.html', 'utf8')).replace('</head>', `${fontPreloads}\n</head>`);
const outlet = '<div id="root"></div>';
if (!template.includes(outlet)) throw new Error('Missing prerender outlet');
await mkdir('dist/prerender', { recursive: true });
for (const route of ['/', '/what-we-do', '/how-it-works', '/ai-workforce', '/control', '/contact']) {
  const shell = route === '/' ? template : renderApplicationRoute(template, route);
  const body = render(route);
  if (!body.includes('<h1') || !body.includes('<main')) throw new Error(`Incomplete prerender: ${route}`);
  const html = shell.replace(outlet, () => `<div id="root">${body}</div>`);
  await writeFile(route === '/' ? 'dist/index.html' : `dist/prerender${route}.html`, html);
}
console.log('Prerendered all six core marketing pages.');
