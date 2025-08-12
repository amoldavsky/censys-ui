// Simple Bun static server for the built SPA (dist/)
import { join } from "node:path";

const dist = join(import.meta.dir, "dist");

const server = Bun.serve({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);

    console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

    // Handle root path
    if (pathname === "/") {
      console.log(`Serving root -> index.html`);
      const index = Bun.file(join(dist, "index.html"));
      return new Response(index, {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-cache"
        }
      });
    }

    // Check if this is a request for a static asset
    // Static assets typically have file extensions or are in specific directories
    const isStaticAsset = (
      pathname.includes('.') ||
      pathname.startsWith('/assets/') ||
      pathname.startsWith('/static/') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/manifest') ||
      pathname.startsWith('/robots')
    );

    if (isStaticAsset) {
      // Try to serve static files
      const file = Bun.file(join(dist, pathname));
      if (await file.exists()) {
        console.log(`✓ Serving static file: ${pathname}`);
        return new Response(file);
      } else {
        console.log(`✗ Static file not found: ${pathname}`);
        return new Response("Not Found", { status: 404 });
      }
    }

    // For all other routes (SPA routes), serve index.html
    // This includes routes like:
    // - /hosts
    // - /hosts/192.168.1.100
    // - /web
    // - /web/example.com
    // - /data
    console.log(`🔄 SPA route: ${pathname} -> index.html`);
    const index = Bun.file(join(dist, "index.html"));

    if (!(await index.exists())) {
      console.error(`❌ index.html not found in ${dist}`);
      return new Response("index.html not found", { status: 500 });
    }

    return new Response(index, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  },
});

console.log(`⚡ Serving dist at http://localhost:${server.port}`);
console.log(`📁 Serving files from: ${dist}`);
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);

// Check if index.html exists
const indexExists = await Bun.file(join(dist, "index.html")).exists();
console.log(`📄 index.html exists: ${indexExists}`);

if (!indexExists) {
  console.error(`❌ CRITICAL: index.html not found at ${join(dist, "index.html")}`);
  console.error(`❌ Make sure to run 'npm run build' before starting the server`);
}
