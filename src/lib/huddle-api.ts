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
  {
    id: "priya-2",
    channel: "general",
    body: "Awesome, thank you 🙏",
    author: "Priya Shah",
    time: "9:44 AM",
  },
  {
    id: "jordan-2",
    channel: "general",
    body: "This looks really clean! Just left two small comments on the empty state copy.",
    author: "Jordan Lee",
    time: "9:47 AM",
  },
  {
    id: "marcus-1",
    channel: "general",
    body: "Jumping in late — can someone recap the decision on the empty state illustration?",
    author: "Marcus Webb",
    time: "9:52 AM",
  },
];

// Temporary in-memory service. The UI only depends on this interface, so the
// real HTTP and Socket.IO implementation can be added without changing screens.
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
    await delay(700);
    if (typeof navigator !== "undefined" && !navigator.onLine)
      throw new Error("offline");
    return channel === "general" ? generalMessages : [];
  },
  async sendMessage(payload: {
    channel: string;
    body: string;
  }): Promise<Message> {
    await delay(250);
    return {
      id: crypto.randomUUID(),
      channel: payload.channel,
      body: payload.body,
      author: "Jordan Lee",
      time: new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    };
  },
};
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
