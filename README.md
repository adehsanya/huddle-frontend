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

Network calls are isolated in `src/lib/huddle-api.ts`. It currently provides local data so the frontend can run independently. Replace that implementation with the backend API and Socket.IO client once the server URL, authentication format, events, and payload schemas are confirmed. See `docs/REALTIME_INTEGRATION.md` for the handoff checklist.
