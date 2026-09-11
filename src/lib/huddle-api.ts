import { io, Socket } from "socket.io-client";

const API_URL =
  import.meta.env.VITE_API_URL ?? "https://huddle-api-yott.onrender.com/api";
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? "https://huddle-api-yott.onrender.com";
const TOKEN_KEY = "huddle_access_token";
const USER_KEY = "huddle_user";

export type User = { id: number; name: string; email: string };
export type Workspace = { id: number; name: string };
export type Channel = {
  id: number;
  name: string;
  description?: string | null;
  workspaceId: number;
};
export type Message = {
  id: number | string;
  channelId: number;
  body: string;
  author: string;
  authorId?: number;
  time: string;
  createdAt?: string;
};
export type SignUpPayload = { name: string; email: string; password: string };
export type LoginPayload = {
  email: string;
  password: string;
  remember: boolean;
};

type ApiResponse<T> = { status: "success"; data: T; message?: string };
type MessagePayload = {
  id: number | string;
  body: string;
  channelId: number;
  createdAt?: string;
  author?: User | { id: number; name: string };
  user?: User | { id: number; name: string };
};

let socket: Socket | undefined;

function readToken() {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

function saveSession(token: string, user: User, persistent: boolean) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

async function request<T>(path: string, options: RequestInit = {}) {
  const token = readToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message ?? "Unable to complete the request.");
  }

  return payload as ApiResponse<T>;
}

function normalizeMessage(message: MessagePayload): Message {
  const author = message.author ?? message.user;
  const createdAt = message.createdAt
    ? new Date(message.createdAt)
    : new Date();

  return {
    id: message.id,
    channelId: Number(message.channelId),
    body: message.body,
    author: author?.name ?? "Team member",
    authorId: author?.id,
    createdAt: message.createdAt,
    time: new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(createdAt),
  };
}

function getSocket() {
  const token = readToken();
  if (!token) throw new Error("Please log in before opening a channel.");

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 8,
    });
  } else {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }

  return socket;
}

export const huddleApi = {
  async signUp(payload: SignUpPayload) {
    const response = await request<{ token: string; user: User }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(payload) },
    );
    saveSession(response.data.token, response.data.user, true);
    return response.data.user;
  },

  async logIn(payload: LoginPayload) {
    const response = await request<{ token: string; user: User }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      },
    );
    saveSession(response.data.token, response.data.user, payload.remember);
    socket?.disconnect();
    socket = undefined;
    return response.data.user;
  },

  async listWorkspaces() {
    const response = await request<Workspace[]>("/workspaces");
    return response.data;
  },

  async getProfile() {
    const response = await request<User>("/auth/profile");
    return response.data;
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(readToken());
  },

  async createWorkspace(name: string) {
    const response = await request<Workspace>("/workspaces", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    return response.data;
  },

  async joinWorkspace(workspaceId: number) {
    await request(`/workspaces/${workspaceId}/join`, { method: "POST" });
    return workspaceId;
  },

  async listChannels(workspaceId: number) {
    const response = await request<Channel[]>(
      `/workspaces/${workspaceId}/channels`,
    );
    return response.data;
  },

  async createChannel(
    workspaceId: number,
    name: string,
    description?: string,
  ) {
    const response = await request<Channel>(
      `/workspaces/${workspaceId}/channels`,
      {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description?.trim() || undefined,
        }),
      },
    );
    return response.data;
  },

  async joinChannel(channelId: number) {
    await request(`/channels/${channelId}/join`, { method: "POST" });
  },

  async loadMessages(channelId: number) {
    const response = await request<MessagePayload[]>(
      `/channels/${channelId}/messages`,
    );
    return response.data.map(normalizeMessage);
  },

  subscribeToMessages(
    channelId: number,
    onMessage: (message: Message) => void,
  ) {
    const activeSocket = getSocket();
    const join = () => activeSocket.emit("channel:join", channelId);
    const receive = (message: MessagePayload) => {
      if (Number(message.channelId) === channelId) {
        onMessage(normalizeMessage(message));
      }
    };

    if (activeSocket.connected) join();
    activeSocket.on("connect", join);
    activeSocket.on("message:new", receive);

    return () => {
      activeSocket.emit("channel:leave", channelId);
      activeSocket.off("connect", join);
      activeSocket.off("message:new", receive);
    };
  },

  async sendMessage(channelId: number, body: string) {
    const response = await request<MessagePayload>(
      `/channels/${channelId}/messages`,
      { method: "POST", body: JSON.stringify({ body }) },
    );
    return normalizeMessage(response.data);
  },

  signOut() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    socket?.disconnect();
    socket = undefined;
  },
};
