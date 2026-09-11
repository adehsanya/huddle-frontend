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

The app currently uses a mock adapter in `src/lib/huddle-api.ts`. Replace those methods with the backend API and Socket.IO client once the backend team supplies the URL, authentication format, event names, and payload schemas. See `docs/REALTIME_INTEGRATION.md` for the handoff checklist.
