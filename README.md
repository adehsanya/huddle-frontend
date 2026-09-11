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

Network calls are isolated in `src/lib/huddle-api.ts`. Registration, login,
workspace/channel retrieval, and message persistence use the deployed REST API.
JWTs are stored in browser storage and passed to Socket.IO, which handles
channel rooms and live `message:new` delivery. See
`docs/REALTIME_INTEGRATION.md` for the integration contract.
