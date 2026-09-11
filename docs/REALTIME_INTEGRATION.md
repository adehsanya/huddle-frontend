# Backend integration

The frontend connects to the deployed Huddle backend on Render.

## REST

- `POST /api/auth/register` registers a user and stores the returned JWT.
- `POST /api/auth/login` authenticates a user and stores the returned JWT.
- `GET /api/workspaces` retrieves the signed-in user's workspaces.
- `POST /api/workspaces` creates a workspace.
- `POST /api/workspaces/:id/join` joins a workspace by numeric ID.
- `GET /api/workspaces/:id/channels` retrieves real channel IDs.
- `GET /api/channels/:id/messages` retrieves persisted message history.
- `POST /api/channels/:id/messages` persists a message before broadcast.

Authenticated requests use `Authorization: Bearer <JWT>`.

## Socket.IO

The client connects with `auth: { token: JWT }` and uses the backend events
defined on the `dev` branch:

- `channel:join` with the numeric channel ID
- `channel:leave` with the numeric channel ID
- `message:new` for live messages broadcast after a successful REST write

Socket.IO is used for live delivery. The REST API remains the source of truth
for message persistence and history.

## Environment

    VITE_API_URL=https://huddle-api-yott.onrender.com/api
    VITE_SOCKET_URL=https://huddle-api-yott.onrender.com

The backend's `CLIENT_ORIGIN` must include the deployed frontend origin or the
browser will reject both REST and Socket.IO connections through CORS.
