# Second Chair

Second Chair is a human-guided AI chief-of-staff prototype for founders. This fork adds a native macOS workspace while preserving the original validation website.

## Native macOS app

The SwiftUI app includes:

- a daily operating brief;
- a persistent human approval queue;
- business workstreams across lead generation, sales, marketing, operations, finance, and people;
- an executive brief for decisions and exceptions;
- a transparent connector map that distinguishes sandbox demonstrations from roadmap-only integrations.

The current build uses local sample data. It does not send messages, launch ads, update marketplaces, move money, or mutate live CRM data.

### Run

Requirements: macOS 14 or later and Swift 6.

```bash
bash ./script/build_and_run.sh
```

Use `bash ./script/build_and_run.sh --verify` to build, launch, and confirm the process is running. The Codex environment also exposes the same command as its Run action.

### Test

```bash
swift test
```

## Validation website

The original static landing page remains at the repository root in `index.html`, with its supporting CSS and JavaScript unchanged.

### SEC-8 public copy boundary

The public website is Step 1 validation copy, not a production privacy policy or launch claim. Keep the page explicit about these limits:

- Step 1 only collects the waitlist fields in `app.js`: name, work email, time-sink note, willingness-to-pay answer, referral, generated ID, and submission time.
- Step 1 does not connect to a prospect's inbox, calendar, documents, CRM, finance tools, ad accounts, marketplaces, or private systems.
- Atharv is the human operator reviewing Step 1 submissions and any concierge pilot work.
- Responses are submitted through FormSubmit to Atharv by email, retained for up to 180 days for validation, and not sold or shared with ad networks.
- Deletion requests should be routed through the same email address that follows up with the submitter until a durable public deletion address is chosen.
- Before an approved pilot, Second Chair must not send messages, submit forms, schedule meetings, launch ads, update CRMs or marketplaces, move money, modify documents, or make other live changes.
- In pilots, external actions remain approval-gated and require explicit human approval first.
