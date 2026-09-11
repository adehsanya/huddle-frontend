# Realtime messaging handoff

The frontend messaging UI is complete and currently uses the adapter in `lib/huddle-api.ts`. The backend team can replace the mock methods without changing the screen components.

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
