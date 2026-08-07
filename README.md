# Second Chair

Second Chair is a validation-stage, human-guided AI chief of staff for founder-led operating work.

This legacy repository contains two surfaces:

- an archived macOS SwiftUI prototype built with SwiftPM;
- the production public validation website.

The supported Second Chair macOS and iPhone/iPad clients live in the canonical `second-chair-kimi` repository. The prototype here is retained as history and is not a distribution source.

## macOS App

The app opens into a chat-first Second Chair workspace. It persists the local transcript, approval queue, active Manus task id, and sample workstreams across launches.

Manus is optional at launch time:

- set `MANUS_API_KEY` before running the app to use Manus;
- optionally set `MANUS_BASE_URL` to override the default `https://api.manus.ai`;
- without a key, the app runs in local demo mode and never performs network calls.

Run it from the repo root:

```bash
./script/build_and_run.sh
```

The Codex app Run button is wired through `.codex/environments/environment.toml`.

## Public Surface

- `index.html` is the active validation landing page.
- `styles.css`, `site.js`, and `app.js` provide the page styling and browser behavior.
- `privacy.html`, `thank-you.html`, and `404.html` provide supporting public routes.
- `server.mjs` serves an explicit static allowlist with production security headers and a health contract.
- `sitemap.xml`, `llms.txt`, `robots.txt`, Open Graph metadata, and `og-second-chair.png` support discovery and social previews.
- `_headers` remains a defense-in-depth declaration for static hosts; Railway uses the headers emitted by `server.mjs`.

## Safety Boundary

Second Chair remains in Step 1 validation. The macOS app uses Manus for chat, research, and draft synthesis, but it does not confirm external actions. No live connector writes, billing, scheduling, messaging, ad launch, marketplace updates, CRM mutation, payment movement, or deployment actions are enabled by this app.

## Deployment

The active public URL is `https://www.chair02.com/`.

The site is deployed to the Railway project and service `chair02-waitlist`.

```bash
npm test
npm start
```

Railway uses `railway.json`, runs the Node 22 static server, and verifies `/healthz` before completing a deployment.
