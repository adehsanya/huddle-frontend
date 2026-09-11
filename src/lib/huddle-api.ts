import { io, Socket } from "socket.io-client";

export type Message = {
  id: string;
  channel: string;
  body: string;
  author: string;
  time: string;
};

export type SignUpPayload = { name: string; email: string; password: string };
export type LoginPayload = {
  email: string;
  password: string;
  remember: boolean;
};

type IncomingMessage = Partial<Message> & {
  _id?: string;
  messageId?: string;
  clientId?: string;
  channelId?: string;
  content?: string;
  text?: string;
  sender?: string | { name?: string };
  createdAt?: string;
};

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ?? "https://huddle-api-yott.onrender.com";
const socketPath = import.meta.env.VITE_SOCKET_PATH ?? "/socket.io";
const events = {
  join: import.meta.env.VITE_SOCKET_JOIN_EVENT ?? "join_channel",
  leave: import.meta.env.VITE_SOCKET_LEAVE_EVENT ?? "leave_channel",
  send: import.meta.env.VITE_SOCKET_SEND_EVENT ?? "send_message",
  message: import.meta.env.VITE_SOCKET_MESSAGE_EVENT ?? "new_message",
};

let socket: Socket | undefined;

function getSocket() {
  if (!socket) {
    socket = io(socketUrl, {
      path: socketPath,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 8,
      auth: (callback) => {
        callback({ token: localStorage.getItem("huddle_access_token") });
      },
    });
  }

  return socket;
}

function normalizeMessage(
  input: IncomingMessage,
  fallbackChannel: string,
): Message {
  const createdAt = input.createdAt ? new Date(input.createdAt) : new Date();
  const sender =
    typeof input.sender === "string" ? input.sender : input.sender?.name;

  return {
    id:
      input.id ??
      input._id ??
      input.messageId ??
      input.clientId ??
      crypto.randomUUID(),
    channel: input.channel ?? input.channelId ?? fallbackChannel,
    body: input.body ?? input.content ?? input.text ?? "",
    author: input.author ?? sender ?? "Team member",
    time:
      input.time ??
      new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
      }).format(createdAt),
  };
}

const generalMessages: Message[] = [
  {
    id: "priya-1",
    channel: "general",
    body: "Morning! I just pushed the updated onboarding flow — mind taking a look before standup?",
    author: "Priya Shah",
    time: "9:41 AM",
  },
  {
    id: "jordan-1",
    channel: "general",
    body: "On it — pulling it up now.",
    author: "Jordan Lee",
    time: "9:43 AM",
  },
];

export const huddleApi = {
  async signUp(payload: SignUpPayload) {
    await delay(650);
    return { id: "local-user", name: payload.name };
  },

  async logIn(_payload: LoginPayload) {
    await delay(650);
    return { id: "local-user", name: "Jordan Lee" };
  },

  async loadMessages(channel: string): Promise<Message[]> {
    await delay(400);
    if (!navigator.onLine) throw new Error("offline");
    return channel === "general" ? generalMessages : [];
  },

  subscribeToMessages(channel: string, onMessage: (message: Message) => void) {
    const activeSocket = getSocket();
    const handleMessage = (message: IncomingMessage) => {
      const normalized = normalizeMessage(message, channel);
      if (normalized.channel === channel) onMessage(normalized);
    };

    activeSocket.emit(events.join, { channelId: channel, channel });
    activeSocket.on(events.message, handleMessage);

    return () => {
      activeSocket.emit(events.leave, { channelId: channel, channel });
      activeSocket.off(events.message, handleMessage);
    };
  },

  async sendMessage(payload: {
    channel: string;
    body: string;
  }): Promise<Message> {
    const activeSocket = getSocket();
    const clientId = crypto.randomUUID();
    const outgoing = {
      clientId,
      channelId: payload.channel,
      channel: payload.channel,
      content: payload.body,
      body: payload.body,
    };

    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        resolve(
          normalizeMessage(
            { ...outgoing, id: clientId, author: "Jordan Lee" },
            payload.channel,
          ),
        );
      }, 3000);

      activeSocket.emit(events.send, outgoing, (ack?: IncomingMessage) => {
        window.clearTimeout(timeout);
        resolve(
          normalizeMessage(
            ack ?? { ...outgoing, id: clientId, author: "Jordan Lee" },
            payload.channel,
          ),
        );
      });
    });
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
