# Public website SEO

The canonical public host is `https://www.chair02.com`. Durable project decisions and release evidence live in the Atharv Second Brain; Linear is a secondary tracker and must be reconciled from verified records.

## Rendering contract

`npm run build` builds the Vite client and a build-only React server entry, then writes complete HTML for `/`, `/what-we-do`, `/how-it-works`, `/ai-workforce`, `/control`, and `/contact`. The browser hydrates the same React components. The Node server reads the generated files; it does not run Vite in production. Other public pages are rendered by `pages.mjs`.

Keep the explicit route allowlist, one H1, route-specific metadata, readable body content without JavaScript, strict CSP, and genuine 404s. Core fonts are preloaded from their hashed build names. Build-server files are not exposed through the public asset allowlist.

Canonical host redirects apply only to the exact apex Host header, use a fixed destination, and preserve paths and query strings. Do not trust arbitrary forwarded hosts. GET/HEAD redirects do not change the existing form submission route.

## Search intent map

These are editorial targets, not measured search volumes or ranking claims.

| Route | Primary purpose |
| --- | --- |
| `/` | Brand and managed AI operations for growing businesses |
| `/what-we-do` | Managed AI service scope and ongoing responsibilities |
| `/ai-workforce` | Business AI workforce capabilities |
| `/how-it-works` | Pilot and deployment process |
| `/control` | Human control and approval responsibilities |
| `/workflows/*` | Specific operating problems and bounded pilot examples |
| `/insights/*` | Choosing, controlling, and measuring AI workflows |

Use `seo-content.mjs` for supporting-page titles, descriptions, worked examples, and related reading. Keep examples labelled as illustrative. Do not invent clients, performance benchmarks, personal credentials, or customer results. Article markup must match visible organizational authorship and genuine modification dates. Update only changed URLs in the sitemap.

## Verification

Use Node 22: `npm test` runs the production build and automated tests. Run `npm audit --omit=dev` and inspect the diff. Check desktop/mobile navigation, accordion behaviour, the six-step form with invalid input only, referral hydration, browser console errors, and no-JavaScript reading. Do not submit test leads to the live provider.

Review the website privacy notice in `pages.mjs` and the product privacy route before rollout. This SEO change adds no analytics, cookies, storage, collection, provider access, or AI processing; no privacy disclosure change is required.

## Release prerequisites

Publishing requires explicit approval under the operating instructions. Preserve the current dirty checkout; do not overwrite prior work or deploy unrelated repository files.

The apex currently resolves through GoDaddy forwarding, while www resolves to Railway. Railway reports the apex traffic record needs updating. An application deployment alone cannot repair requests intercepted by that forwarding service. Use a path-preserving permanent forwarding configuration or the already documented DNS migration to an apex-flattening provider. Do not pin a transient Railway IP or change nameservers without rechecking DNSSEC and all existing mail/API records. Confirm current Railway DNS requirements and certificate readiness before a cutover.

After publishing, check all sitemap URLs, raw HTML, genuine missing-route 404s, mobile rendering, and both HTTP/HTTPS apex deep-link redirects with query strings. Verify the served titles and content match this release. In an authenticated Search Console property, inspect the six core URLs, check sitemap status, and request indexing where appropriate. Compare query/page impressions, clicks, and conversions after sufficient observation; do not promise a ranking change or represent Lighthouse as field Core Web Vitals.
