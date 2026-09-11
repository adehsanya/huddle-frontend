# Huddle Frontend

Figma-aligned frontend for Huddle, built with React, TypeScript, and Vite.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Backend integration

Network calls are isolated in `src/lib/huddle-api.ts`. Channel messages use
Socket.IO with automatic reconnection, room join/leave events, acknowledgements,
and incoming-message subscriptions. The socket URL and event names are configured
through Vite environment variables. See `docs/REALTIME_INTEGRATION.md` for the
backend handoff checklist.
