import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { createServer } from "../server.mjs";
import { createLeadRecord, validateWaitlist } from "../app.js";

let server;
let origin;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  origin = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("public page has canonical social and structured metadata", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /rel="canonical" href="https:\/\/www\.chair02\.com\/"/);
  assert.match(html, /property="og:image" content="https:\/\/www\.chair02\.com\/og-second-chair\.png"/);
  assert.match(html, /type="application\/ld\+json"/);
  assert.match(html, /href="\/privacy\.html"/);
});

test("server applies real security headers and a real 404", async () => {
  const home = await fetch(`${origin}/`);
  assert.equal(home.status, 200);
  assert.equal(home.headers.get("x-frame-options"), "DENY");
  assert.match(home.headers.get("content-security-policy"), /frame-ancestors 'none'/);

  const missing = await fetch(`${origin}/missing-page`);
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /That page stepped out/);
});

test("health contract and SEO discovery files are available", async () => {
  const health = await fetch(`${origin}/healthz`);
  assert.deepEqual(await health.json(), { ok: true });
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  assert.match(robots, /Sitemap: https:\/\/www\.chair02\.com\/sitemap\.xml/);
  assert.equal((await fetch(`${origin}/sitemap.xml`)).status, 200);
  assert.equal((await fetch(`${origin}/llms.txt`)).status, 200);
});

test("waitlist validation and normalization remain bounded", () => {
  assert.ok(Object.keys(validateWaitlist({})).length > 0);
  const record = createLeadRecord({
    workflowArea: "reporting",
    frequency: "weekly",
    name: " Ada   Lovelace ",
    email: "ADA@EXAMPLE.COM",
    timeSink: " Weekly   operating recap ",
    willingnessToPay: "yes",
  }, { id: "lead-test", now: "2026-08-08T00:00:00.000Z", referral: "Launch!" });
  assert.equal(record.name, "Ada Lovelace");
  assert.equal(record.email, "ada@example.com");
  assert.equal(record.referral, "launch");
});
