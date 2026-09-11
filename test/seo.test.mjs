import assert from 'node:assert/strict';
import { request } from 'node:http';
import { test } from 'node:test';
import { createServer } from '../server.mjs';
import { readFile } from 'node:fs/promises';

async function withServer(run) {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('all core pages deliver route-specific content without JavaScript', () => withServer(async origin => {
  const headings = new Set();
  for (const route of ['/', '/what-we-do', '/how-it-works', '/ai-workforce', '/control', '/contact']) {
    const response = await fetch(origin + route);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, route);
    headings.add(html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]);
    assert.match(html, /<main\b/);
    assert.match(html, /href="\/contact"/);
    assert.doesNotMatch(html, /<div id="root"><\/div>/);
    assert.ok(!/\sstyle="/.test(html), `${route} must work with the strict stylesheet CSP`);
    if (route !== '/') assert.match(html, new RegExp(`aria-current="page"[^>]*href="${route}"|href="${route}"[^>]*aria-current="page"|contact-page`));
  }
  assert.equal(headings.size, 6);
}));

test('apex redirects preserve paths and queries without trusting forwarded hosts', () => withServer(async origin => {
  async function get(path, headers, method = 'GET') {
    return new Promise((resolve, reject) => {
      const req = request(origin + path, { headers, method }, res => {
        res.resume(); res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location }));
      });
      req.on('error', reject); req.end();
    });
  }
  for (const method of ['GET', 'HEAD']) {
    const result = await get('/workflows/lead-research?source=pilot%20guide', {host:'chair02.com'}, method);
    assert.equal(result.status, 308);
    assert.equal(result.location, 'https://www.chair02.com/workflows/lead-research?source=pilot%20guide');
  }
  const alias = await get('/about.html?source=guide', {host:'chair02.com'});
  assert.equal(alias.location, 'https://www.chair02.com/about?source=guide');
  const spoof = await get('/about', {'x-forwarded-host':'evil.example'});
  assert.equal(spoof.status, 200);
  assert.equal(spoof.location, undefined);
}));

test('canonical path redirects retain campaign attribution', () => withServer(async origin => {
  const response = await fetch(origin + '/what-we-do/?source=guide', {redirect:'manual'});
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), '/what-we-do?source=guide');
}));

test('unknown content slugs remain genuine 404s', () => withServer(async origin => {
  for (const path of ['/workflows/__proto__', '/insights/constructor', '/insights/not-a-guide']) {
    assert.equal((await fetch(origin + path)).status, 404, path);
  }
}));

test('workflow guides give bounded examples and editorial pages identify their publisher', () => withServer(async origin => {
  const workflow = await (await fetch(origin + '/workflows/lead-research')).text();
  assert.match(workflow, /Illustrative deliverable/);
  assert.match(workflow, /href="\/control"/);
  assert.match(workflow, /href="\/insights\/choose-one-workflow"/);
  const article = await (await fetch(origin + '/insights/choose-one-workflow')).text();
  assert.match(article, /Worked example/);
  assert.match(article, /href="\/workflows\/lead-research"/);
  const schema = JSON.parse(article.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const blog = schema['@graph'].find(x => x['@type'] === 'Article');
  assert.equal(blog.author.name, 'Second Chair');
  assert.equal(blog.dateModified, '2026-09-06');
  assert.match(article, /datetime="2026-09-06"/);
}));

test('every sitemap page has one H1 and only working local links', () => withServer(async origin => {
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  const paths = [...sitemap.matchAll(/<loc>https:\/\/www\.chair02\.com([^<]*)<\/loc>/g)].map(x => x[1]);
  const linked = new Set();
  for (const path of paths) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, path);
    assert.match(html, new RegExp(`rel="canonical" href="https://www\\.chair02\\.com${path}"`));
    for (const [, href] of html.matchAll(/<a\b[^>]*href="(\/[^"#?]*)"/g)) linked.add(href);
  }
  for (const path of linked) assert.equal((await fetch(origin + path)).status, 200, path);
}));
