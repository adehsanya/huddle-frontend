# Realtime messaging handoff

The frontend messaging UI connects through Socket.IO in
`src/lib/huddle-api.ts`. It joins and leaves channel rooms, listens for incoming
messages, sends messages with acknowledgement support, reconnects automatically,
and prevents duplicate messages in the UI.

The current event-name defaults are:

- `join_channel`
- `leave_channel`
- `send_message`
- `new_message`

They can be changed without editing source code through the
`VITE_SOCKET_*_EVENT` environment variables. The backend team must confirm that
these names and payload fields match the server implementation.

## Backend details needed

- Socket.IO server URL
- Connection path, if it differs from `/socket.io`
- Authentication method and token source
- Join/leave channel event names and payloads
- Incoming-message event name and payload
- Send-message event name, acknowledgement payload, and error payload
- Reconnection and message-history expectations

## Frontend message shape

```ts
type Message = {
  id: string;
  channel: string;
  body: string;
  author: string;
  time: string;
};
```

Keep transport-specific code inside the adapter. The UI already covers channel loading, connection errors, empty channels, populated conversations, sending, and sent messages.
