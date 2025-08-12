## Censys UI — Local POC (Vue 3 + Vite)

A lightweight frontend to explore Hosts and Web assets with detail views, maps, and an AI chat side panel. This README is optimized for a reviewer running the project locally on macOS.

### Prerequisites (macOS)
- Bun 1.1+ (recommended)
  - Install: `curl -fsSL https://bun.sh/install | bash` then restart your terminal
- Optional: Node 18+ if you prefer using `npx vite` for ad‑hoc runs (scripts use Bun by default)

Alternative without Bun:
- Use Node 18+ and run:
  - Install deps: `npm install`
  - Dev server: `npx vite`
  - Build: `npx vite build`
  - Preview: `npx vite preview`


### Quick Start (Mock Data — no backend required)
1. Install dependencies
   - `bun install`
2. Use mock data
   - In `src/services/api.ts`, set `USE_MOCK_DATA = true` (see snippet below)
3. Start the dev server
   - `bun run dev`
4. Open http://localhost:5173
   - Try: `/hosts`, `/web`, and a detail like `/hosts/192.168.1.100`

### Using a Real API (Optional)
- Configure API base URL in `.env` (already set by default): `VITE_API_URL=http://localhost:3000`
- Ensure your backend exposes these endpoints:
  - `GET /api/v1/assets/hosts`, `GET /api/v1/assets/hosts/{ip}`
  - `GET /api/v1/assets/web`, `GET /api/v1/assets/web/{domain}`
  - `POST /api/v1/chat` for the AI assistant (sends full message history each turn)
- Keep `USE_MOCK_DATA = false` to use the real API.
- Start dev: `bun run dev` and browse http://localhost:5173

Notes:
- The AI chat requires a working `/api/v1/chat` endpoint. In mock mode it will show an error if the chat API is unavailable.
- If your API runs on another host/port, update `.env` accordingly and restart the dev server.

### Build and Preview (Production-like)
1. Build: `bun run build`
2. Preview with the included SPA server: `bun run serve`
3. Open http://localhost:3000

Environment modes available out of the box:
- `.env.development` (default): `VITE_API_URL=http://localhost:3000`
- `.env.staging`
- `.env.production`

You can also override at build-time:
- `VITE_API_URL=https://custom.example.com bun run build`

### Useful Scripts
- `bun run dev` — Vite dev server (port 5173)
- `bun run build` — Production build to `dist/`
- `bun run preview` — Preview the built app with Vite
- `bun run serve` — Serve `dist/` with the included Bun server (SPA routing supported)

### Where to Toggle Mock Data
Below is the single toggle for using mock vs real API:

```ts
// src/services/api.ts
// Configuration: Set to false to use real API, true to use mock data
const USE_MOCK_DATA = true
```

After changing this value, restart the dev server.


### Troubleshooting
- Port in use: change Vite dev port in vite.config.ts (server.port) or stop the other process.
- Blank page or 404s after build: use `bun run serve` which handles SPA routing; static file servers must fall back to index.html.
- API errors with real backend: confirm `.env` has the correct `VITE_API_URL`, the backend is running, and CORS allows http://localhost:5173.
