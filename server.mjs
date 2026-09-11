import { createServer as createHTTPServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createLeadRecord, submitLead, validateWaitlist } from "./app.js";
import { renderPublicPage } from "./pages.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.join(root, "dist");
const routes = new Map([
  ["/", path.join("dist", "index.html")],
  ["/index.html", path.join("dist", "index.html")],
  ["/thank-you.html", "thank-you.html"],
  ["/404.html", "404.html"],
  ["/styles.css", "styles.css"],
  ["/site.js", "site.js"],
  ["/app.js", "app.js"],
  ["/favicon.svg", "favicon.svg"],
  ["/og-second-chair.png", "og-second-chair.png"],
  ["/og-second-chair.svg", "og-second-chair.svg"],
  ["/robots.txt", "robots.txt"],
  ["/sitemap.xml", "sitemap.xml"],
  ["/llms.txt", "llms.txt"],
]);

const applicationRoutes = new Set([
  "/what-we-do",
  "/how-it-works",
  "/ai-workforce",
  "/control",
  "/contact",
]);

const siteOrigin = "https://www.chair02.com";
const applicationMetadata = Object.freeze({
  "/what-we-do": {
    title: "Managed AI Operations Services | Second Chair",
    description: "Second Chair designs and operates tailored AI workforces for growing businesses, connecting practical AI capabilities to the systems and work you already use.",
    label: "What we do",
  },
  "/how-it-works": {
    title: "How Managed AI Operations Work | Second Chair",
    description: "See how Second Chair learns your operation, designs a focused paid pilot, deploys a managed AI workforce, and expands only what proves useful.",
    label: "How it works",
  },
  "/ai-workforce": {
    title: "AI Workforce for Business Operations | Second Chair",
    description: "Explore the AI workforce Second Chair coordinates across executive operations, sales, support, marketing, retention, and finance workflows.",
    label: "AI workforce",
  },
  "/control": {
    title: "Human-Controlled AI Operations | Second Chair",
    description: "See how Second Chair applies customer-defined control policies, keeping human review for consequential work while approved routines move with less friction.",
    label: "Control",
  },
  "/contact": {
    title: "Start a Managed AI Operations Pilot | Second Chair",
    description: "Discuss a focused paid pilot with Second Chair. Share the recurring work that is getting stuck, and we will assess whether managed AI operations are a fit.",
    label: "Contact us",
  },
});

const exactCanonicalRedirects = new Map([
  ["/index.html", "/"],
  ["/about.html", "/about"],
  ["/workflows.html", "/workflows"],
  ["/insights.html", "/insights"],
  ["/privacy.html", "/privacy"],
  ["/terms.html", "/terms"],
]);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".woff2", "font/woff2"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
]);

const securityHeaders = Object.freeze({
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; upgrade-insecure-requests",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Origin-Agent-Cluster": "?1",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "off",
  "X-Frame-Options": "DENY",
  "X-Permitted-Cross-Domain-Policies": "none",
});

export function createServer(options = {}) {
  const relayEndpoint = approvedRelayEndpoint(options.formSubmitEndpoint ?? process.env.FORM_SUBMIT_ENDPOINT);
  const fetcher = options.fetcher ?? globalThis.fetch;
  return createHTTPServer(async (request, response) => {
    try {
      for (const [name, value] of Object.entries(securityHeaders)) {
        response.setHeader(name, value);
      }
      if (!request.url) {
        return sendText(response, request.method, 405, "Method not allowed.\n", "no-store");
      }
      const requestedUrl = new URL(request.url, "http://second-chair.local");
      const pathname = requestedUrl.pathname;
      if (pathname === "/api/waitlist") {
        if (request.method !== "POST") {
          return sendText(response, request.method, 405, "Method not allowed.\n", "no-store", "text/plain; charset=utf-8", "POST");
        }
        return submitWaitlist(request, response, { relayEndpoint, fetcher });
      }
      if (!["GET", "HEAD"].includes(request.method ?? "")) {
        return sendText(response, request.method, 405, "Method not allowed.\n", "no-store");
      }
      if (pathname === "/healthz") {
        return sendText(response, request.method, 200, '{"ok":true}\n', "no-store", "application/json; charset=utf-8");
      }

      const redirectPath = canonicalRedirectPath(pathname);
      if (/^chair02\.com(?::\d+)?$/i.test(request.headers.host ?? "")) {
        return sendRedirect(response, request.method, `${siteOrigin}${redirectPath ?? pathname}${requestedUrl.search}`);
      }
      if (redirectPath) return sendRedirect(response, request.method, `${redirectPath}${requestedUrl.search}`);

      const publicPage = renderPublicPage(pathname);
      const applicationRoute = applicationRoutes.has(pathname);
      const assetFile = /^\/assets\/[A-Za-z0-9._-]+$/.test(pathname)
        ? path.join(distRoot, "assets", path.basename(pathname))
        : null;
      const file = routes.get(pathname);
      const statusCode = publicPage || applicationRoute || assetFile || (file && pathname !== "/404.html") ? 200 : 404;
      const selectedFile = assetFile ?? (file ? path.join(root, file) : path.join(root, "404.html"));
      const body = publicPage
        ? Buffer.from(publicPage)
        : applicationRoute
          ? await readFile(path.join(distRoot, "prerender", `${pathname.slice(1)}.html`))
          : await readFile(selectedFile);
      const extension = publicPage || applicationRoute ? ".html" : path.extname(selectedFile);
      response.statusCode = statusCode;
      response.setHeader("Content-Type", contentTypes.get(extension) ?? "application/octet-stream");
      response.setHeader("Cache-Control", cacheControl(extension, statusCode, pathname));
      response.setHeader("Content-Length", body.byteLength);
      if (request.method === "HEAD") return response.end();
      response.end(body);
    } catch {
      sendText(response, request.method, 500, "Service unavailable.\n", "no-store");
    }
  });
}

export function renderApplicationRoute(index, pathname) {
  const canonical = `${siteOrigin}${pathname}`;
  const metadata = applicationMetadata[pathname];
  const safeTitle = escapeAttribute(metadata.title);
  const safeDescription = escapeAttribute(metadata.description);
  return index
    .replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/s, `<meta name="description" content="${safeDescription}">`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${safeTitle}">`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:description" content="${safeDescription}">`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${safeTitle}">`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/s, `<meta name="twitter:description" content="${safeDescription}">`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(applicationStructuredData(pathname, metadata))}</script>`);
}

function applicationStructuredData(pathname, metadata) {
  const canonical = `${siteOrigin}${pathname}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteOrigin}/#organization`,
        name: "Second Chair",
        url: `${siteOrigin}/`,
        email: "support@chair02.com",
        logo: `${siteOrigin}/og-second-chair.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        url: `${siteOrigin}/`,
        name: "Second Chair",
        publisher: { "@id": `${siteOrigin}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "WebPage",
        "@id": canonical,
        url: canonical,
        name: metadata.title,
        description: metadata.description,
        isPartOf: { "@id": `${siteOrigin}/#website` },
        about: { "@id": `${siteOrigin}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteOrigin}/` },
          { "@type": "ListItem", position: 2, name: metadata.label, item: canonical },
        ],
      },
    ],
  };
}

function canonicalRedirectPath(pathname) {
  const exact = exactCanonicalRedirects.get(pathname);
  if (exact) return exact;
  if (pathname.length <= 1 || !pathname.endsWith("/")) return null;
  const trimmed = pathname.slice(0, -1);
  return applicationRoutes.has(trimmed) || renderPublicPage(trimmed) ? trimmed : null;
}

function sendRedirect(response, method, location) {
  response.statusCode = 308;
  response.setHeader("Location", location);
  response.setHeader("Cache-Control", "public, max-age=86400");
  response.setHeader("Content-Length", "0");
  response.end(method === "HEAD" ? undefined : "");
}

function escapeAttribute(value) {
  return String(value).replace(/[&<>"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
  }[character]));
}

function sendText(response, method, statusCode, body, cache, contentType = "text/plain; charset=utf-8", allow = "GET, HEAD") {
  const encoded = Buffer.from(body);
  response.statusCode = statusCode;
  response.setHeader("Content-Type", contentType);
  response.setHeader("Cache-Control", cache);
  response.setHeader("Content-Length", encoded.byteLength);
  response.setHeader("Allow", allow);
  response.end(method === "HEAD" ? undefined : encoded);
}

function approvedRelayEndpoint(candidate) {
  if (typeof candidate !== "string" || !candidate) return null;
  try {
    const endpoint = new URL(candidate);
    const isApproved = endpoint.protocol === "https:"
      && endpoint.hostname === "formsubmit.co"
      && /^\/ajax\/[a-f0-9]{32}$/i.test(endpoint.pathname)
      && !endpoint.search
      && !endpoint.hash;
    return isApproved ? endpoint.toString() : null;
  } catch {
    return null;
  }
}

async function submitWaitlist(request, response, { relayEndpoint, fetcher }) {
  if (!relayEndpoint) {
    return sendJson(response, 503, { error: "Pilot conversations are temporarily unavailable." });
  }

  let input;
  try {
    input = await readJsonBody(request);
  } catch {
    return sendJson(response, 400, { error: "Please check your answers and try again." });
  }

  if (!input || Array.isArray(input) || typeof input !== "object") {
    return sendJson(response, 400, { error: "Please check your answers and try again." });
  }

  if (Object.keys(validateWaitlist(input)).length > 0) {
    return sendJson(response, 400, { error: "Please check your answers and try again." });
  }

  try {
    const record = createLeadRecord(input, { referral: input.referral });
    await submitLead(record, { endpoint: relayEndpoint, format: "email", fetcher });
  } catch {
    return sendJson(response, 502, { error: "We could not start that conversation. Please try again." });
  }

  return sendJson(response, 202, { success: true, status: "received" });
}

async function readJsonBody(request) {
  const chunks = [];
  let byteLength = 0;
  for await (const chunk of request) {
    byteLength += chunk.length;
    if (byteLength > 8_192) throw new Error("Request body is too large.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response, statusCode, payload) {
  const body = Buffer.from(JSON.stringify(payload));
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Length", body.byteLength);
  response.end(body);
}

function cacheControl(extension, statusCode, pathname = "") {
  if (statusCode !== 200 || extension === ".html") return "public, max-age=300";
  if (pathname.startsWith("/assets/")) return "public, max-age=31536000, immutable";
  if ([".png", ".svg"].includes(extension)) return "public, max-age=86400, stale-while-revalidate=604800";
  return "public, max-age=3600, stale-while-revalidate=86400";
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const parsedPort = Number.parseInt(process.env.PORT ?? "3000", 10);
  const port = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65_535 ? parsedPort : 3000;
  createServer().listen(port, "0.0.0.0", () => {
    console.log(`Second Chair public site listening on port ${port}`);
  });
}
