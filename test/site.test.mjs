import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { createServer } from "../server.mjs";
import { createLeadRecord, submitLead, validateWaitlist } from "../app.js";

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
  const [html, source] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(html, /rel="canonical" href="https:\/\/www\.chair02\.com\/"/);
  assert.match(html, /property="og:image" content="https:\/\/www\.chair02\.com\/og-second-chair\.png"/);
  assert.match(html, /type="application\/ld\+json"/);
  assert.match(html, /"@type":"WebSite"/);
  assert.match(html, /"@type":"Organization"/);
  assert.match(source, /href="\/privacy"/);
});

test("homepage presents the managed AI operating relationship, not a one-workflow company", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(source, /managed AI operations/i);
  assert.match(source, /AI workforce/i);
  assert.match(source, /understand.*design.*pilot.*operate.*expand/is);
  assert.match(source, /pilot is the doorway/i);
  assert.match(source, /customer-defined control policies/i);
  assert.doesNotMatch(source, /Fix one recurring workflow\. Prove whether it is worth keeping/i);
});

test("homepage covers the multi-function AI workforce and long-term managed service", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  for (const capability of [
    "Executive operations",
    "Sales",
    "Customer retention",
    "Marketing",
    "Customer support",
    "Finance operations",
  ]) {
    assert.match(source, new RegExp(capability));
  }
  assert.match(source, /operate.*maintain.*improve.*expand/is);
  assert.match(source, /same Second Chair platform/i);
});

test("homepage is light-first and avoids pill-like informational badges", async () => {
  const [source, conversation, appStyles, themeStyles] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/pilot-conversation.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app.css", import.meta.url), "utf8"),
    readFile(new URL("../src/index.css", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(source, /<Badge\b/);
  assert.doesNotMatch(conversation, /<Badge\b/);
  assert.doesNotMatch(appStyles, /\.dark\s*\{/);
  assert.doesNotMatch(themeStyles, /\.dark\s*\{/);
  assert.match(appStyles, /--canvas:\s*#f7f5ef/i);
  assert.match(appStyles, /body[^}]*background:\s*var\(--canvas\)/s);
});

test("public surfaces are text-first, tag-free, contactable, and intentionally typeset", async () => {
  const [source, conversation, accordion, sheet, publicPages, errorPage, thankYouPage, entry, appStyles] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/pilot-conversation.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/accordion.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/sheet.jsx", import.meta.url), "utf8"),
    readFile(new URL("../pages.mjs", import.meta.url), "utf8"),
    readFile(new URL("../404.html", import.meta.url), "utf8"),
    readFile(new URL("../thank-you.html", import.meta.url), "utf8"),
    readFile(new URL("../src/main.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app.css", import.meta.url), "utf8"),
  ]);

  for (const interactiveSource of [source, conversation, accordion, sheet]) {
    assert.doesNotMatch(interactiveSource, /lucide-react/);
  }
  const publicSource = [source, conversation, publicPages, errorPage, thankYouPage].join("\n");
  assert.doesNotMatch(publicSource, /Second Chair is operating/i);
  assert.doesNotMatch(publicSource, /[→←✓✦]/);
  assert.doesNotMatch(publicSource, /(?:eyebrow|kicker|control-label|live-status|activity-icon|capability-icon|success-icon)/);
  assert.match(source, />Contact us</);
  assert.match(source, /className="home-contact"/);
  assert.match(source, /href="\/contact"/);
  assert.match(entry, /@fontsource-variable\/newsreader/);
  assert.match(appStyles, /--serif:\s*"Newsreader Variable"/);
  assert.match(appStyles, /\[data-reveal\]/);
  assert.match(appStyles, /prefers-reduced-motion:\s*reduce/);
});

test("primary sections are dedicated pages instead of homepage scroll anchors", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  for (const pathname of ["/what-we-do", "/how-it-works", "/ai-workforce", "/control", "/contact"]) {
    assert.match(source, new RegExp(`href=["']${pathname}["']`));
    const response = await fetch(`${origin}${pathname}`);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    assert.match(html, new RegExp(`rel="canonical" href="https://www\\.chair02\\.com${pathname}"`));
    assert.match(html, /<main\b/);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, pathname);
  }
  assert.doesNotMatch(source, /href=["']#(?:what-we-do|how-it-works|workforce|control|contact)["']/);
});

test("primary pages expose unique search metadata and route-matched structured data", async () => {
  const expected = new Map([
    ["/what-we-do", "Managed AI Operations Services | Second Chair"],
    ["/how-it-works", "How Managed AI Operations Work | Second Chair"],
    ["/ai-workforce", "AI Workforce for Business Operations | Second Chair"],
    ["/control", "Human-Controlled AI Operations | Second Chair"],
    ["/contact", "Start a Managed AI Operations Pilot | Second Chair"],
  ]);

  const descriptions = new Set();
  for (const [pathname, expectedTitle] of expected) {
    const html = await (await fetch(`${origin}${pathname}`)).text();
    assert.match(html, new RegExp(`<title>${expectedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/title>`));
    assert.match(html, new RegExp(`property="og:title" content="${expectedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
    assert.ok(description && description.length >= 120 && description.length <= 160, `${pathname} description length`);
    descriptions.add(description);
    assert.match(html, /"@type":"BreadcrumbList"/);
    assert.match(html, new RegExp(`https:\\/\\/www\\.chair02\\.com${pathname.replaceAll("/", "\\/")}`));
  }
  assert.equal(descriptions.size, expected.size);
});

test("canonical aliases permanently redirect instead of competing for indexing", async () => {
  for (const [alias, canonical] of [["/index.html", "/"], ["/what-we-do/", "/what-we-do"], ["/about.html", "/about"]]) {
    const response = await fetch(`${origin}${alias}`, { redirect: "manual" });
    assert.equal(response.status, 308, alias);
    assert.equal(response.headers.get("location"), canonical);
  }
});

test("homepage uses owned shadcn components as its sole UI component system", async () => {
  const [config, source, button, card, badge, accordion, sheet, conversation] = await Promise.all([
    readFile(new URL("../components.json", import.meta.url), "utf8"),
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/button.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/card.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/badge.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/accordion.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/sheet.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/pilot-conversation.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(config, /"style":\s*"(?:new-york|radix-nova)"/);
  assert.match(source, /components\/ui\/button/);
  assert.match(source, /components\/ui\/card/);
  assert.doesNotMatch(source, /components\/ui\/badge/);
  assert.match(source, /components\/ui\/accordion/);
  assert.match(source, /components\/ui\/sheet/);
  assert.match(source, /<Sheet modal=\{false\}/);
  assert.doesNotMatch(source, /from ["'](?:@mui|antd|@chakra-ui|react-bootstrap)/);
  assert.doesNotMatch(conversation, /from ["'](?:@mui|antd|@chakra-ui|react-bootstrap)/);
  assert.match(button, /buttonVariants/);
  assert.match(card, /CardContent/);
  assert.match(badge, /badgeVariants/);
  assert.match(accordion, /AccordionTrigger/);
  assert.match(sheet, /SheetContent/);
});

test("server applies real security headers and a real 404", async () => {
  const home = await fetch(`${origin}/`);
  assert.equal(home.status, 200);
  assert.equal(home.headers.get("x-frame-options"), "DENY");
  assert.match(home.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.match(home.headers.get("content-security-policy"), /upgrade-insecure-requests/);
  assert.equal(home.headers.get("referrer-policy"), "no-referrer");
  assert.equal(home.headers.get("origin-agent-cluster"), "?1");
  assert.equal(home.headers.get("x-permitted-cross-domain-policies"), "none");
  assert.equal(
    home.headers.get("strict-transport-security"),
    "max-age=63072000; includeSubDomains; preload",
  );

  const missing = await fetch(`${origin}/missing-page`);
  assert.equal(missing.status, 404);
  const missingBody = await missing.text();
  assert.match(missingBody, /That page isn’t on today’s agenda/);
  assert.match(missingBody, /href="\/"/);
  assert.match(missingBody, /href="\/contact"/);
  assert.equal(missing.headers.get("x-frame-options"), "DENY");

  const direct404 = await fetch(`${origin}/404.html`);
  assert.equal(direct404.status, 404);
  assert.match(await direct404.text(), /Useful places to continue/);
});

test("health contract and SEO discovery files are available", async () => {
  const health = await fetch(`${origin}/healthz`);
  assert.deepEqual(await health.json(), { ok: true });
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  assert.match(robots, /Sitemap: https:\/\/www\.chair02\.com\/sitemap\.xml/);
  assert.equal((await fetch(`${origin}/sitemap.xml`)).status, 200);
  assert.equal((await fetch(`${origin}/llms.txt`)).status, 200);
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  for (const pathname of ["/what-we-do", "/how-it-works", "/ai-workforce", "/control", "/contact"]) {
    assert.match(sitemap, new RegExp(`<loc>https:\\/\\/www\\.chair02\\.com${pathname.replaceAll("/", "\\/")}<\\/loc>`));
  }
  const thankYou = await (await fetch(`${origin}/thank-you.html`)).text();
  assert.match(thankYou, /<meta name="robots" content="noindex,follow">/);

  const homepage = await (await fetch(`${origin}/`)).text();
  const assets = [...homepage.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
  assert.ok(assets.length >= 2);
  for (const asset of assets) {
    const response = await fetch(`${origin}${asset}`);
    assert.equal(response.status, 200, asset);
    assert.match(response.headers.get("cache-control"), /max-age=31536000/);
    assert.match(response.headers.get("cache-control"), /immutable/);
  }
});

test("recovered public routes continue to resolve with canonical metadata", async () => {
  const sitemap = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");
  const paths = [...sitemap.matchAll(/<loc>https:\/\/www\.chair02\.com([^<]*)<\/loc>/g)]
    .map((match) => match[1] || "/");
  assert.ok(paths.length >= 17);
  for (const pathname of paths) {
    const response = await fetch(`${origin}${pathname}`);
    assert.equal(response.status, 200, pathname);
    assert.match(await response.text(), /rel="canonical"/);
  }
});

test("discovery describes the managed pilot model without legacy positioning", async () => {
  const [sitemap, llms] = await Promise.all([
    readFile(new URL("../sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../llms.txt", import.meta.url), "utf8"),
  ]);
  assert.match(sitemap, /\/workflows\/lead-research/);
  assert.match(sitemap, /\/insights\/choose-one-workflow/);
  assert.match(sitemap, /\/terms/);
  assert.match(llms, /managed AI operations/i);
  assert.match(llms, /AI workforce/i);
  assert.match(llms, /paid pilot/i);
  assert.doesNotMatch(llms, /early-access/i);
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

test("six-step pilot conversation keeps the FormSubmit payload schema without posting a real lead", async () => {
  const source = await readFile(new URL("../src/components/pilot-conversation.jsx", import.meta.url), "utf8");
  assert.match(source, /workflowArea/);
  assert.match(source, /frequency/);
  assert.match(source, /timeSink/);
  assert.match(source, /willingnessToPay/);
  assert.match(source, /name/);
  assert.match(source, /email/);
  assert.match(source, /New Second Chair pilot conversation/);

  let request;
  const record = createLeadRecord({
    workflowArea: "admin",
    frequency: "weekly",
    name: "Pilot Test",
    email: "pilot@example.com",
    timeSink: "Repeated handoffs.",
    willingnessToPay: "maybe",
  }, { id: "pilot-test", now: "2026-08-26T00:00:00.000Z" });
  const result = await submitLead(record, {
    endpoint: "https://example.test/form",
    format: "email",
    fetcher: async (url, options) => {
      request = { url, options };
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    },
  });
  assert.equal(result.status, "emailed");
  assert.equal(request.url, "https://example.test/form");
  const payload = JSON.parse(request.options.body);
  assert.equal(payload._subject, "New Second Chair pilot conversation");
  assert.equal(payload.workflowArea, "admin");
  assert.equal(payload.frequency, "weekly");
  assert.equal(payload.timeSink, "Repeated handoffs.");
  assert.equal(payload.willingnessToPay, "maybe");
  assert.equal(payload.name, "Pilot Test");
  assert.equal(payload.email, "pilot@example.com");
});

test("pilot conversations use a same-origin route and fail closed without server relay configuration", async () => {
  const [clientSource, serverSource] = await Promise.all([
    readFile(new URL("../src/components/pilot-conversation.jsx", import.meta.url), "utf8"),
    readFile(new URL("../server.mjs", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(clientSource, /formsubmit\.co/i);
  assert.match(clientSource, /submitLead\(record\)/);
  assert.doesNotMatch(serverSource, /connect-src 'self' https:\/\/formsubmit\.co/);

  const response = await fetch(`${origin}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workflowArea: "admin",
      frequency: "weekly",
      name: "Pilot Test",
      email: "pilot@example.com",
      timeSink: "Repeated handoffs.",
      willingnessToPay: "maybe",
    }),
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "Pilot conversations are temporarily unavailable.",
  });
});
