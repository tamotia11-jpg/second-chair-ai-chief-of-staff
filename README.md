# Second Chair

Second Chair is a validation-stage, human-guided AI chief of staff for founder-led operating work.

This repo now contains two surfaces:

- a native macOS SwiftUI app built with SwiftPM;
- the static GitHub Pages validation website.

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
- `thank-you.html` handles the post-submit confirmation path.
- `_headers`, `robots.txt`, and `favicon.svg` support the hosted static deployment.

## Safety Boundary

Second Chair remains in Step 1 validation. The macOS app uses Manus for chat, research, and draft synthesis, but it does not confirm external actions. No live connector writes, billing, scheduling, messaging, ad launch, marketplace updates, CRM mutation, payment movement, or deployment actions are enabled by this app.

## Deployment

The active public URL is:

`https://tamotia11-jpg.github.io/second-chair-ai-chief-of-staff/`

Deployments are made by pushing the static files in this repository to GitHub Pages.
