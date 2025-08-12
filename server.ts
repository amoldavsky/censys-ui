// Simple Bun static server for the built SPA (dist/)
import { join } from "node:path";

const dist = join(import.meta.dir, "dist");

const server = Bun.serve({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);

    console.log(`Request: ${req.method} ${pathname}`);

    // Handle root path
    if (pathname === "/") {
      pathname = "index.html";
    }

    // Check if this is a request for a static asset
    const isStaticAsset = pathname.includes('.') || pathname.startsWith('/assets/');

    if (isStaticAsset) {
      // Try to serve static files (assets, js, css, etc.)
      const file = Bun.file(join(dist, pathname));
      if (await file.exists()) {
        console.log(`Serving static file: ${pathname}`);
        return new Response(file);
      } else {
        console.log(`Static file not found: ${pathname}`);
        return new Response("Not Found", { status: 404 });
      }
    }

    // For all other routes (SPA routes like /hosts, /web, etc.), serve index.html
    // This is crucial for client-side routing to work
    console.log(`Serving SPA route: ${pathname} -> index.html`);
    const index = Bun.file(join(dist, "index.html"));
    return new Response(index, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache" // Prevent caching of the SPA entry point
      }
    });
  },
});

console.log(`⚡ Serving dist at http://localhost:${server.port}`);
