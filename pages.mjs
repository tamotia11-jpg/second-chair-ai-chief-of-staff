import { workflowExamples, editorialExamples, relatedReading, searchMetadata } from './seo-content.mjs';

const siteOrigin = "https://www.chair02.com";

const workflows = Object.freeze({
  "lead-research": {
    title: "Lead generation and research",
    problem: "Teams lose time finding the basic context needed to decide which prospects are worth pursuing.",
    assessment: "We look at where prospect information comes from, who checks it, and which signals make a lead actionable.",
    pilot: "Prepare a focused research brief using the sources and rules your team approves.",
    control: "A sales owner reviews the brief and decides whether any customer-facing follow-up happens.",
    measure: "Research handling time, brief acceptance, and the volume of usable records.",
  },
  "sales-follow-through": {
    title: "Sales follow-through",
    problem: "Qualified enquiries and sales conversations lose momentum when follow-up is inconsistent across inboxes and records.",
    assessment: "We map the handoffs, timing, source material, and approval points around the current follow-up process.",
    pilot: "Identify the appropriate next step and prepare a response or CRM update using approved context.",
    control: "Sales staff approve or modify customer-facing communication before it is sent.",
    measure: "Response time, approval rate, missed follow-ups, and relevant workflow volume.",
  },
  "marketing-launch-prep": {
    title: "Marketing launch preparation",
    problem: "Launch work creates repeated coordination between campaign notes, approved messages, assets, and owners.",
    assessment: "We examine the recurring preparation work, the source of truth, and where work waits for context or review.",
    pilot: "Prepare a structured launch pack from approved inputs and flag the decisions that still need an owner.",
    control: "The responsible marketer reviews the pack before anything is published or passed externally.",
    measure: "Preparation time, review rounds, missing inputs, and handoff quality.",
  },
  "inbox-calendar-admin": {
    title: "Inbox, calendar, and administration",
    problem: "Routine coordination requires people to keep switching between messages, calendars, documents, and internal records.",
    assessment: "We trace one repeatable administrative loop and identify the information gathering that makes it slow.",
    pilot: "Prepare the approved parts of that loop, such as a meeting brief, scheduling option, or internal update.",
    control: "A designated employee reviews consequential or ambiguous actions before execution.",
    measure: "Handling time, intervention rate, completion rate, and exceptions encountered.",
  },
  "finance-people-documents": {
    title: "Finance, people, and documents",
    problem: "Routine records and document work often require repeated checking, copying, and exception handling.",
    assessment: "We identify which records are suitable for a narrow pilot and which decisions must remain with the responsible person.",
    pilot: "Prepare or perform only the agreed low-risk updates using the approved workflow.",
    control: "Higher-risk, unusual, or externally consequential changes require explicit review.",
    measure: "Processing time, exception rate, approval rate, and rework required.",
  },
  "reporting-cadence": {
    title: "Reporting and operating cadence",
    problem: "Teams spend recurring time chasing inputs, reconciling notes, and preparing the same operating update.",
    assessment: "We map the reporting cycle, owners, inputs, decisions, and recurring gaps in the current cadence.",
    pilot: "Prepare an agreed operating brief from approved sources and clearly separate evidence from open questions.",
    control: "The responsible operator reviews the brief before it informs an internal or external decision.",
    measure: "Preparation time, input completeness, review changes, and cadence reliability.",
  },
});

const insights = Object.freeze({
  "choose-one-workflow": {
    title: "Choose one workflow before choosing a tool",
    summary: "A narrow operating problem is easier to assess, control, and measure than a broad automation ambition.",
    sections: [
      ["Start with repetition", "A useful starting point returns often enough to be observed. It has a recognisable beginning, a handoff, and an outcome a team already cares about."],
      ["Make the boundary visible", "Do not begin with every task a business could automate. Define the specific work, the inputs it uses, and the point at which the responsible person needs to decide."],
      ["Agree what would count", "A pilot is more useful when the team agrees in advance which evidence matters: time, response speed, approvals, exceptions, volume, or another concrete operating measure."],
    ],
  },
  "human-approval-before-action": {
    title: "Design human approval before action",
    summary: "Approval is an operating decision, not a decorative safety feature.",
    sections: [
      ["Separate preparation from execution", "Preparing a draft, recommendation, or record is different from sending, publishing, changing, or committing it. A workflow should make that distinction legible."],
      ["Use risk and context", "Some low-risk, repeatable actions may be appropriate to execute under an agreed policy. External, ambiguous, financial, or otherwise consequential actions need a responsible review point."],
      ["Review the policy with the work", "Approval design should change when the process changes. The point is not to add a permanent bottleneck; it is to make accountability explicit."],
    ],
  },
  "measure-coordination-drag": {
    title: "Measure coordination drag without inventing a result",
    summary: "A pilot earns trust by comparing agreed evidence, not by promising a percentage before work begins.",
    sections: [
      ["Record the starting point", "Before a pilot, capture the practical baseline relevant to the chosen workflow. That might be handling time, response time, approval rate, intervention rate, failure rate, or volume."],
      ["Keep the measure close to the work", "A broad productivity story obscures what changed. Choose a small set of measures that the team can understand and inspect alongside the workflow."],
      ["Make the decision explicit", "At the end of the pilot, review the evidence together. Stopping is a valid result when the value is not sufficient; continuation should be earned, not assumed."],
    ],
  },
  "concierge-before-automation": {
    title: "Why operational involvement comes before scale",
    summary: "A workflow can only be productised responsibly after someone has understood how it actually runs.",
    sections: [
      ["Implementation is part of the offer", "Early work includes discovery, configuration, integration, review design, and close observation. That involvement is how the service stays grounded in the customer’s operating reality."],
      ["Repeated work creates a clearer product", "As patterns recur, the operating method can become more standardised. The goal is an increasingly productised operating platform, built from real work rather than abstract claims."],
      ["Do not hide the relationship", "A managed service is not a self-serve tool waiting for a customer to figure it out. The customer should know who is responsible for the workflow as it changes."],
    ],
  },
  "what-counts-as-validation": {
    title: "What counts as a useful pilot result",
    summary: "A useful pilot is controlled enough to learn from and concrete enough to decide on.",
    sections: [
      ["A clear scope", "The pilot should name one recurring workflow, its current bottleneck, the agreed intervention, and the points where a person remains responsible."],
      ["Observable evidence", "The team should be able to see what was prepared, reviewed, executed, changed, or stopped. Evidence is more valuable than a polished demonstration."],
      ["A real decision", "The customer and Second Chair should finish with a shared decision: stop, continue operating the workflow, or expand carefully into an additional justified area."],
    ],
  },
});

function escape(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[character]));
}

function header() {
  return `<header class="site-header"><a class="wordmark" href="/" aria-label="Second Chair home">Second Chair<span>.</span></a><nav aria-label="Main navigation"><a href="/workflows">Workflows</a><a href="/about">About</a><a href="/insights">Insights</a><a class="nav-cta" href="/contact">Contact us</a></nav></header>`;
}

function footer() {
  return `<footer><span class="wordmark wordmark--light">Second Chair<span>.</span></span><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:support@chair02.com">Contact</a></div><p>Managed AI operations for growing businesses.</p></footer>`;
}

function page({ title, description, pathname, heading, lede, content, article = false }) {
  const canonical = `${siteOrigin}${pathname}`;
  const safeTitle = escape(title);
  const safeDescription = escape(description);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${safeDescription}">
    <meta name="theme-color" content="#f5f1e8">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="${article ? "article" : "website"}">
    <meta property="og:site_name" content="Second Chair">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${siteOrigin}/og-second-chair.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Second Chair managed AI operations">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${siteOrigin}/og-second-chair.png">
    <script type="application/ld+json">${JSON.stringify(pageStructuredData({ title, description, pathname, heading, article }))}</script>
    <title>${safeTitle}</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/styles.css?v=20260826-pilot">
  </head>
  <body class="subpage${article ? " article-page" : ""}">
    <a class="skip-link" href="#main">Skip to content</a>
    ${header()}
    <main class="content-page" id="main">
      <h1>${escape(heading)}</h1>
      <p class="content-lede">${escape(lede)}</p>
      ${content}
    </main>
    ${footer()}
  </body>
</html>`;
}

function pageStructuredData({ title, description, pathname, heading, article }) {
  const canonical = `${siteOrigin}${pathname}`;
  const parts = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ "@type": "ListItem", position: 1, name: "Home", item: `${siteOrigin}/` }];
  if (parts.length > 1 && ["workflows", "insights"].includes(parts[0])) {
    const label = parts[0] === "workflows" ? "Workflows" : "Insights";
    breadcrumbs.push({ "@type": "ListItem", position: 2, name: label, item: `${siteOrigin}/${parts[0]}` });
  }
  breadcrumbs.push({ "@type": "ListItem", position: breadcrumbs.length + 1, name: heading, item: canonical });
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": canonical,
        url: canonical,
        name: title,
        description,
        isPartOf: { "@id": `${siteOrigin}/#website` },
        about: { "@id": `${siteOrigin}/#organization` },
        inLanguage: "en",
      },
      { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      ...(article ? [{
        "@type": "Article",
        "@id": `${canonical}#article`,
        headline: heading,
        description,
        mainEntityOfPage: { "@id": canonical },
        author: { "@type": "Organization", name: "Second Chair", url: `${siteOrigin}/about` },
        publisher: { "@type": "Organization", "@id": `${siteOrigin}/#organization`, name: "Second Chair", url: `${siteOrigin}/` },
        dateModified: "2026-09-06",
        inLanguage: "en",
      }] : []),
    ],
  };
}

function operationRows(entries) {
  return `<section class="operation-rows" aria-label="Operating model">${entries.map(([label, text]) => `<article><h2>${escape(label)}</h2><p>${escape(text)}</p></article>`).join("")}</section>`;
}

function continuingCta() {
  return `<aside class="content-cta"><h2>Show us how your business actually works.</h2><p>We identify where AI can create operating value, then choose a focused paid pilot as the low-risk way to begin.</p><a class="button button--primary" href="/contact">Contact us</a></aside>`;
}

function workflowPage(slug) {
  if (!Object.hasOwn(workflows, slug)) return null;
  const workflow = workflows[slug];
  if (!workflow) return null;
  return page({
    title: searchMetadata[slug][0],
    description: searchMetadata[slug][1],
    pathname: `/workflows/${slug}`,
    heading: workflow.title,
    lede: "This is an example of a focused engagement, not a promised customer result. The actual scope is agreed with the business before work begins.",
    content: `${operationRows([
      ["The recurring problem", workflow.problem],
      ["What we examine", workflow.assessment],
      ["What a narrow pilot may handle", workflow.pilot],
      ["Human control", workflow.control],
      ["What we measure", workflow.measure],
      ["What determines next steps", "At the end of the pilot, we review the agreed evidence together and explicitly decide to stop, continue, or expand."],
    ])}${operationRows([
      ["Inputs to agree before starting", workflowExamples[slug].inputs],
      ["Illustrative deliverable", workflowExamples[slug].output],
      ["Scope and exclusions", workflowExamples[slug].boundary],
      ["How to assess the pilot", workflowExamples[slug].evaluation],
    ])}<section class="article-section"><h2>Plan the next step</h2><p>Use our guide to <a href="/insights/choose-one-workflow">choosing a first AI workflow</a>, agree <a href="/control">human review and control</a>, and <a href="/insights/measure-coordination-drag">measure the complete operating cost</a> before expanding.</p></section>${continuingCta()}`,
  });
}

function workflowsIndex() {
  const rows = Object.entries(workflows).map(([slug, workflow]) => `<a class="listing-row" href="/workflows/${slug}"><div><h2>${escape(workflow.title)}</h2><p>${escape(workflow.problem)}</p></div></a>`).join("");
  return page({
    title: "Workflow pilots — Second Chair",
    description: "Examples of recurring operating workflows where Second Chair can assess a focused, human-guided paid pilot.",
    pathname: "/workflows",
    heading: "Choose the work, not the technology.",
    lede: "Each example begins with a recurring operating problem, a narrow intervention, and an explicit point of human control.",
    content: `<section class="listing" aria-label="Example workflow pilots">${rows}</section>${continuingCta()}`,
  });
}

function insightsIndex() {
  const rows = Object.entries(insights).map(([slug, insight]) => `<a class="listing-row" href="/insights/${slug}"><div><h2>${escape(insight.title)}</h2><p>${escape(insight.summary)}</p></div></a>`).join("");
  return page({
    title: "Insights — Second Chair",
    description: "Practical notes on choosing, controlling, and measuring recurring workflows.",
    pathname: "/insights",
    heading: "Practical judgment for work that repeats.",
    lede: "These notes focus on the choices that make a workflow pilot useful: where to start, when to review, and how to measure what changed.",
    content: `<section class="listing" aria-label="Insights">${rows}</section>${continuingCta()}`,
  });
}

function insightPage(slug) {
  if (!Object.hasOwn(insights, slug)) return null;
  const insight = insights[slug];
  if (!insight) return null;
  const body = [...insight.sections, ...editorialExamples[slug]].map(([heading, text]) => `<section class="article-section"><h2>${escape(heading)}</h2><p>${escape(text)}</p></section>`).join("");
  const [relatedPath, relatedLabel] = relatedReading[slug];
  return page({
    title: searchMetadata[slug][0],
    description: searchMetadata[slug][1],
    pathname: `/insights/${slug}`,
    heading: insight.title,
    lede: insight.summary,
    content: `<p>By <a href="/about">Second Chair</a> · Updated <time datetime="2026-09-06">6 September 2026</time></p><article class="article-body">${body}<section class="article-section"><h2>Put the guide into practice</h2><p><a href="${relatedPath}">${escape(relatedLabel)}</a>, or explore <a href="/workflows">the workflow pilot examples</a> to find a scope your team can assess.</p></section></article>${continuingCta()}`,
    article: true,
  });
}

function aboutPage() {
  return page({
    title: "About Second Chair — Managed AI operations",
    description: "Second Chair designs, deploys, and operates a tailored AI workforce around the way each customer works.",
    pathname: "/about",
    heading: "The managed AI operating layer for growing businesses.",
    lede: "Second Chair understands how a company runs, builds a tailored AI workforce on the same platform, connects it to approved systems, and remains responsible for operating and improving the deployment.",
    content: `${operationRows([
      ["A focused pilot first", "A narrow first engagement proves Second Chair in the real business without reducing the long-term relationship to one workflow."],
      ["Direct involvement", "Early customers work directly with the people discovering, implementing, reviewing, and operating the workflow."],
      ["Measured pilots", "We define the scope and evidence with the customer, then make a clear decision together at the end of the pilot."],
      ["A managed relationship", "If the workflow proves useful, Second Chair remains responsible for operating and improving it with the customer."],
      ["A clearer platform over time", "Repeated work can become a more standardised operating platform. That productisation follows proven operating patterns; it does not replace the relationship before it exists."],
    ])}${continuingCta()}`,
  });
}

function privacyPage() {
  return page({
    title: "Website privacy — Second Chair",
    description: "Website privacy notice for Second Chair pilot conversations.",
    pathname: "/privacy",
    heading: "Website privacy notice.",
    lede: "Effective 26 August 2026. This notice covers the public Second Chair website at chair02.com and its pilot-conversation form.",
    content: `${operationRows([
      ["What the form collects", "If you ask to discuss a pilot, the form collects the workflow area, frequency, pain description, willingness-to-pay signal, name, work email, referral code, and submission time. Do not submit credentials, customer records, confidential company information, or private financial data."],
      ["Why it is used", "The information is used only to evaluate pilot fit, reply to you, understand demand, prevent abuse, and improve this public service. It is not sold, used for advertising, or shared with ad networks."],
      ["Service provider and retention", "The form is transmitted through FormSubmit and delivered to the project owner by email. The public website does not create an analytics profile or advertising identifier. Submissions are retained for up to 180 days unless they must be retained longer for security, legal, or dispute purposes."],
      ["Cookies and device storage", "The public site does not set advertising or analytics cookies. Browser storage is used only when running the form locally for development; public chair02.com submissions are sent to the email delivery service."],
      ["Your choices", "You may ask to access, correct, or delete a submission by emailing support@chair02.com from the same address used in the form. You may also use that address for privacy questions."],
    ])}`,
  });
}

function termsPage() {
  return page({
    title: "Website terms — Second Chair",
    description: "Terms for the Second Chair public website and pilot-conversation process.",
    pathname: "/terms",
    heading: "Website terms.",
    lede: "Effective 26 August 2026. These terms cover the public Second Chair website and an initial conversation about a possible workflow pilot.",
    content: `${operationRows([
      ["Information on this site", "The site describes an evolving managed operating service. It is general information, not a promise that a particular workflow will be suitable, available, or produce a particular result."],
      ["Pilot conversations", "Submitting the form starts a conversation only. Scope, fees, timing, data access, approval responsibilities, and any continuing service are agreed directly in a separate written arrangement if both parties choose to proceed."],
      ["Human responsibilities", "Customers remain responsible for the people they authorise, the information they provide, and the approvals or decisions assigned to them in an agreed workflow."],
      ["No public checkout", "The site does not offer checkout, payment collection, public pricing, or a self-service product purchase."],
      ["Contact", "For questions about the website or these terms, contact support@chair02.com."],
    ])}`,
  });
}

export function renderPublicPage(pathname) {
  const aliases = new Map([
    ["/about/", "/about"], ["/about.html", "/about"],
    ["/workflows/", "/workflows"], ["/workflows.html", "/workflows"],
    ["/insights/", "/insights"], ["/insights.html", "/insights"],
    ["/privacy/", "/privacy"], ["/privacy.html", "/privacy"],
    ["/terms/", "/terms"], ["/terms.html", "/terms"],
  ]);
  const alias = aliases.get(pathname) ?? pathname;
  const normalized = alias.length > 1 && alias.endsWith("/") ? alias.slice(0, -1) : alias;
  if (normalized === "/about") return aboutPage();
  if (normalized === "/workflows") return workflowsIndex();
  if (normalized === "/insights") return insightsIndex();
  if (normalized === "/privacy") return privacyPage();
  if (normalized === "/terms") return termsPage();
  if (normalized.startsWith("/workflows/")) return workflowPage(normalized.slice("/workflows/".length));
  if (normalized.startsWith("/insights/")) return insightPage(normalized.slice("/insights/".length));
  return null;
}
