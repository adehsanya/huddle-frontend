import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Hash,
  Headphones,
  Home as HomeIcon,
  LoaderCircle,
  LockKeyhole,
  Menu,
  Plus,
  Send,
  X,
} from "lucide-react";
import { huddleApi, Message } from "./lib/huddle-api";

type Screen =
  "welcome" | "signup" | "signup-success" | "login" | "huddle-home" | "chat";
const channels = ["general", "announcements", "product-team", "engineering"];

function BrandPanel({ mode }: { mode: "signup" | "login" }) {
  const signup = mode === "signup";
  return (
    <aside className={`brand-panel ${signup ? "signup-panel" : "login-panel"}`}>
      <img
        src="/figma/huddle-logo-white.png"
        alt="Huddle"
        className="brand-wordmark"
      />
      <p>
        {signup ? (
          <>
            One place for your team to talk, share, and stay in sync — wherever
            you&apos;re working from.
          </>
        ) : (
          <>Good to see you again. Pick up right where your team left off.</>
        )}
      </p>
      {signup && (
        <div className="preview-bubbles" aria-hidden="true">
          <span>Hey team — standup in 5 👋</span>
          <span>On it!</span>
          <span>#product-design channel is live</span>
        </div>
      )}
    </aside>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="field-group">
      <span>{label}</span>
      <span className="password-wrap">
        <LockKeyhole size={15} aria-hidden="true" />
        <input
          required
          minLength={8}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
        />
        <button
          type="button"
          className="icon-button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </span>
      <small>Password must be at least 8 characters.</small>
    </label>
  );
}

function AuthScreen({
  mode,
  navigate,
}: {
  mode: "signup" | "login";
  navigate: (screen: Screen) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (mode === "signup" && password !== confirm)
      return setError("Passwords do not match.");
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        await huddleApi.signUp({ name, email, password });
        navigate("signup-success");
      } else {
        await huddleApi.logIn({ email, password, remember });
        navigate("huddle-home");
      }
    } catch {
      setError("We couldn’t complete that request. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  const signup = mode === "signup";
  return (
    <main className="auth-shell">
      <BrandPanel mode={mode} />
      <section className="form-panel">
        <form className="auth-form" onSubmit={submit}>
          <header>
            <h1>{signup ? "Create your account" : "Log in to Huddle"}</h1>
            <p>
              {signup
                ? "Start collaborating with your team in minutes."
                : "Enter your details to get back into your workspace."}
            </p>
          </header>
          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          <div className="fields">
            {signup && (
              <label className="field-group">
                <span>Full name</span>
                <input
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Fatade"
                />
              </label>
            )}
            <label className="field-group">
              <span>Work email</span>
              <input
                required
                disabled={loading}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <PasswordField
              label={signup ? "Create Password" : "Enter Password"}
              value={password}
              onChange={setPassword}
            />
            {signup && (
              <PasswordField
                label="Confirm Password"
                value={confirm}
                onChange={setConfirm}
              />
            )}
          </div>
          {!signup && (
            <div className="form-options">
              <label>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />{" "}
                Remember me
              </label>
              <button type="button">Forgot password?</button>
            </div>
          )}
          <button
            className={`primary-button ${loading ? "is-loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle size={16} className="spinner" />
                Please wait…
              </>
            ) : signup ? (
              "Create account"
            ) : (
              "Log in"
            )}
          </button>
          <p className="switch-copy">
            {signup ? "Already have an account?" : "New to Huddle?"}{" "}
            <button
              type="button"
              onClick={() => navigate(signup ? "login" : "signup")}
            >
              {signup ? "Log in" : "Create an account"}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}

function SignupSuccess({ navigate }: { navigate: (screen: Screen) => void }) {
  return (
    <main className="success-screen">
      <section className="success-card" role="status" aria-live="polite">
        <img src="/figma/signup-success.png" alt="" />
        <div>
          <p>
            You have Signed up successfully.
            <br />
            Login to access your account
          </p>
          <button className="primary-button" onClick={() => navigate("login")}>
            Login
          </button>
        </div>
      </section>
    </main>
  );
}

function HuddleHome({ navigate }: { navigate: (screen: Screen) => void }) {
  const [modal, setModal] = useState<"create" | "join" | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceUrl, setWorkspaceUrl] = useState("");
  const [workspaceCode, setWorkspaceCode] = useState("");
  function enterWorkspace(event: FormEvent) {
    event.preventDefault();
    navigate("chat");
  }
  return (
    <main className="huddle-home">
      <aside className="home-rail">
        <div>
          <button className="rail-button active" aria-label="Home">
            <HomeIcon size={17} fill="currentColor" />
          </button>
          <button
            className="rail-button"
            aria-label="Add a huddle"
            onClick={() => setModal("create")}
          >
            <Plus size={18} />
          </button>
        </div>
        <button className="rail-avatar" aria-label="Open profile">
          JF
          <i />
        </button>
      </aside>
      <section className="huddle-empty">
        <div className="huddle-empty-content">
          <img
            src="/figma/huddle-home-illustration.png"
            alt="People collaborating as a team"
          />
          <div>
            <h1>
              Great teams <img src="/figma/huddle-logo.png" alt="Huddle" /> here
            </h1>
            <p>You do not belong to any huddles yet</p>
          </div>
          <div className="huddle-actions">
            <button
              className="primary-button"
              onClick={() => setModal("create")}
            >
              Create a new huddle
            </button>
            <button
              className="secondary-button"
              onClick={() => setModal("join")}
            >
              Join a huddle
            </button>
          </div>
        </div>
      </section>
      {modal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <form
            className="workspace-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="workspace-modal-title"
            onSubmit={enterWorkspace}
          >
            <h2 id="workspace-modal-title">
              {modal === "create"
                ? "Create your workspace"
                : "Join an existing workspace"}
            </h2>
            <p>
              {modal === "create"
                ? "Give your team a home. You can invite teammates right after."
                : "Enter the workspace code your teammate shared with you."}
            </p>
            {modal === "create" ? (
              <>
                <label>
                  <span>Workspace name</span>
                  <input
                    required
                    autoFocus
                    value={workspaceName}
                    onChange={(event) => {
                      setWorkspaceName(event.target.value);
                      if (!workspaceUrl)
                        setWorkspaceUrl(
                          event.target.value
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, ""),
                        );
                    }}
                    placeholder="Acme Team"
                  />
                </label>
                <label>
                  <span>Workspace URL</span>
                  <input
                    required
                    value={workspaceUrl}
                    onChange={(event) => setWorkspaceUrl(event.target.value)}
                    placeholder="acme-team.huddle.app"
                  />
                </label>
              </>
            ) : (
              <label>
                <span>Workspace Code</span>
                <input
                  required
                  autoFocus
                  value={workspaceCode}
                  onChange={(event) =>
                    setWorkspaceCode(event.target.value.toUpperCase())
                  }
                  placeholder="8F3K2P"
                  maxLength={12}
                />
              </label>
            )}
            <button className="primary-button" type="submit">
              {modal === "create" ? "Create workspace" : "Join workspace"}
            </button>
            <button
              className="modal-back"
              type="button"
              onClick={() => setModal(null)}
            >
              ← Back
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

function Welcome({ navigate }: { navigate: (screen: Screen) => void }) {
  return (
    <main className="welcome">
      <img src="/figma/huddle-logo.png" alt="Huddle" className="welcome-logo" />
      <section className="welcome-grid">
        <div className="welcome-copy">
          <div className="welcome-heading">
            <h1>
              All your teams
              <br />
              in one place,
              <br />
              <em>working together</em>
            </h1>
          </div>
          <p>Huddle makes it easy for small remote teams to work faster</p>
          <div className="welcome-actions">
            <button
              className="primary-button"
              onClick={() => navigate("signup")}
            >
              Get Started
            </button>
            <button
              className="secondary-button"
              onClick={() => navigate("login")}
            >
              Find existing teams
            </button>
          </div>
          <div className="trusted">
            <span>Trusted by</span>
            <img
              src="/figma/trusted-brands.png"
              alt="Ghost, Todoist, Parse.ly and DuckDuckGo"
            />
          </div>
        </div>
        <img
          src="/figma/welcome-illustration.png"
          alt="Remote teammates collaborating"
          className="hero-art"
        />
      </section>
    </main>
  );
}

function Workspace({ navigate }: { navigate: (screen: Screen) => void }) {
  const [channel, setChannel] = useState("general");
  const [draft, setDraft] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channelState, setChannelState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [sending, setSending] = useState(false);
  const visibleMessages = useMemo(
    () => messages.filter((message) => message.channel === channel),
    [messages, channel],
  );
  async function loadChannel() {
    setChannelState("loading");
    try {
      const loaded = await huddleApi.loadMessages(channel);
      setMessages((current) => [
        ...current.filter((message) => message.channel !== channel),
        ...loaded,
      ]);
      setChannelState("ready");
    } catch {
      setChannelState("error");
    }
  }
  useEffect(() => {
    void loadChannel();
  }, [channel]);
  useEffect(() => {
    return huddleApi.subscribeToMessages(channel, (message) => {
      setMessages((current) => {
        const existingIndex = current.findIndex(
          (item) => item.id === message.id,
        );
        if (existingIndex === -1) return [...current, message];

        const next = [...current];
        next[existingIndex] = message;
        return next;
      });
    });
  }, [channel]);
  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const message = await huddleApi.sendMessage({
        channel,
        body: draft.trim(),
      });
      setMessages((current) =>
        current.some((item) => item.id === message.id)
          ? current
          : [...current, message],
      );
      setDraft("");
    } finally {
      setSending(false);
    }
  }
  return (
    <main className="workspace">
      <button
        className="mobile-menu"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle channels"
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="workspace-name">
          <strong>Money Stack</strong>
          <button aria-label="Add workspace">
            <Plus size={20} />
          </button>
        </div>
        <p className="section-label">CHANNELS</p>
        <nav>
          {channels.map((item) => (
            <button
              key={item}
              className={channel === item ? "active" : ""}
              onClick={() => {
                setChannel(item);
                setMobileOpen(false);
              }}
            >
              <Hash size={14} />
              {item}
            </button>
          ))}
        </nav>
        <button className="add-channel">
          <Plus size={14} />
          Add more channels
        </button>
        <p className="section-label">OTHERS</p>
        <button className="support">
          <Headphones size={15} />
          Support
        </button>
        <div className="user-footer">
          <span className="avatar">
            JL
            <i />
          </span>
          <span>
            <strong>Jordan Lee</strong>
            <small>
              <i />
              Online
            </small>
          </span>
          <ChevronDown size={16} />
        </div>
      </aside>
      <section className="channel-view">
        <header className="channel-header">
          <div>
            <Hash size={15} />
            <strong>{channelState === "loading" ? "Loading…" : channel}</strong>
          </div>
          <span>{channelState === "ready" ? "14 members" : ""}</span>
        </header>
        <div className="message-area">
          {channelState === "loading" ? (
            <div className="channel-status">
              <LoaderCircle size={40} className="spinner" />
              <p>Loading messages…</p>
            </div>
          ) : channelState === "error" ? (
            <div className="channel-status">
              <div className="error-banner">
                <AlertCircle size={20} />
                <span>
                  Couldn&apos;t load this channel. Check your connection and try
                  again.
                </span>
              </div>
              <button className="retry-button" onClick={loadChannel}>
                Retry
              </button>
            </div>
          ) : visibleMessages.length === 0 && !sending ? (
            <div className="empty-state">
              <div className="empty-mark">
                <span />
                <span />
                <span />
              </div>
              <h1>
                {channel === "general" ? (
                  <>
                    Everyone starts in <b># general</b>
                  </>
                ) : (
                  <>
                    Welcome to <b># {channel}</b>
                  </>
                )}
              </h1>
              <p>
                {channel === "general"
                  ? "Share general information with your team here"
                  : "This is a dedicated space for your team"}
              </p>
            </div>
          ) : (
            <div className="message-list">
              {visibleMessages.map((message) => {
                const own = message.author === "Jordan Lee";
                return (
                  <article
                    key={message.id}
                    className={own ? "own-message" : "other-message"}
                  >
                    {!own && (
                      <span className="message-avatar" aria-hidden="true" />
                    )}
                    <div className="bubble-column">
                      {!own && (
                        <header>
                          <strong>{message.author}</strong>
                          <time>{message.time}</time>
                        </header>
                      )}
                      <p>{message.body}</p>
                      {own && <time>{message.time}</time>}
                    </div>
                  </article>
                );
              })}
              {sending && draft.trim() && (
                <article className="own-message pending-message">
                  <div className="bubble-column">
                    <p>{draft.trim()}</p>
                    <time>Sending…</time>
                  </div>
                </article>
              )}
            </div>
          )}
        </div>
        <form className="composer" onSubmit={sendMessage}>
          <div>
            <input
              disabled={channelState !== "ready" || sending}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message #${channel}`}
              aria-label={`Message ${channel}`}
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!draft.trim() || sending}
            >
              {sending ? (
                <LoaderCircle size={17} className="spinner" />
              ) : (
                <Send size={17} fill="currentColor" />
              )}
            </button>
          </div>
        </form>
      </section>
      <button className="signout-button" onClick={() => navigate("login")}>
        Sign out
      </button>
    </main>
  );
}
export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  if (screen === "signup" || screen === "login")
    return <AuthScreen mode={screen} navigate={setScreen} />;
  if (screen === "signup-success")
    return <SignupSuccess navigate={setScreen} />;
  if (screen === "huddle-home") return <HuddleHome navigate={setScreen} />;
  if (screen === "chat") return <Workspace navigate={setScreen} />;
  return <Welcome navigate={setScreen} />;
}
