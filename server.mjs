import { createServer as createHTTPServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const routes = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/privacy", "privacy.html"],
  ["/privacy/", "privacy.html"],
  ["/privacy.html", "privacy.html"],
  ["/thank-you.html", "thank-you.html"],
  ["/404.html", "404.html"],
  ["/styles.css", "styles.css"],
  ["/site.js", "site.js"],
  ["/app.js", "app.js"],
  ["/favicon.svg", "favicon.svg"],
  ["/og-second-chair.png", "og-second-chair.png"],
  ["/robots.txt", "robots.txt"],
  ["/sitemap.xml", "sitemap.xml"],
  ["/llms.txt", "llms.txt"],
]);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
]);

const securityHeaders = Object.freeze({
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formsubmit.co; form-action 'self' https://formsubmit.co; upgrade-insecure-requests",
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

export function createServer() {
  return createHTTPServer(async (request, response) => {
    try {
      for (const [name, value] of Object.entries(securityHeaders)) {
        response.setHeader(name, value);
      }
      if (!request.url || !["GET", "HEAD"].includes(request.method ?? "")) {
        return sendText(response, request.method, 405, "Method not allowed.\n", "no-store");
      }
      const pathname = new URL(request.url, "http://second-chair.local").pathname;
      if (pathname === "/healthz") {
        return sendText(response, request.method, 200, '{"ok":true}\n', "no-store", "application/json; charset=utf-8");
      }

      const file = routes.get(pathname);
      const statusCode = file ? 200 : 404;
      const selectedFile = file ?? "404.html";
      const body = await readFile(path.join(root, selectedFile));
      const extension = path.extname(selectedFile);
      response.statusCode = statusCode;
      response.setHeader("Content-Type", contentTypes.get(extension) ?? "application/octet-stream");
      response.setHeader("Cache-Control", cacheControl(extension, statusCode));
      response.setHeader("Content-Length", body.byteLength);
      if (request.method === "HEAD") return response.end();
      response.end(body);
    } catch {
      sendText(response, request.method, 500, "Service unavailable.\n", "no-store");
    }
  });
}

function sendText(response, method, statusCode, body, cache, contentType = "text/plain; charset=utf-8") {
  const encoded = Buffer.from(body);
  response.statusCode = statusCode;
  response.setHeader("Content-Type", contentType);
  response.setHeader("Cache-Control", cache);
  response.setHeader("Content-Length", encoded.byteLength);
  response.setHeader("Allow", "GET, HEAD");
  response.end(method === "HEAD" ? undefined : encoded);
}

function cacheControl(extension, statusCode) {
  if (statusCode !== 200 || extension === ".html") return "public, max-age=300";
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
