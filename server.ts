// Simple Bun static server for the built SPA (dist/)
import { join } from "node:path";

const dist = join(import.meta.dir, "dist");

const server = Bun.serve({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith("/")) pathname += "index.html";
    const file = Bun.file(join(dist, pathname));
    if (await file.exists()) return new Response(file);
    // SPA fallback
    const index = Bun.file(join(dist, "index.html"));
    return new Response(index, { headers: { "Content-Type": "text/html" } });
  },
});

console.log(`⚡ Serving dist at http://localhost:${server.port}`);
