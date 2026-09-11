import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Hash,
  Headphones,
  Home as HomeIcon,
  LoaderCircle,
  LogOut,
  LockKeyhole,
  Menu,
  Plus,
  Send,
  Settings,
  X,
} from "lucide-react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Channel,
  huddleApi,
  Message,
  User,
  Workspace as WorkspaceType,
} from "./lib/huddle-api";

type NavigateTo = (path: string) => void;

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
  navigate: NavigateTo;
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
        navigate("/signup/success");
      } else {
        await huddleApi.logIn({ email, password, remember });
        navigate("/workspaces");
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
              onClick={() => navigate(signup ? "/login" : "/signup")}
            >
              {signup ? "Log in" : "Create an account"}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}

function SignupSuccess({ navigate }: { navigate: NavigateTo }) {
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
          <button className="primary-button" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </section>
    </main>
  );
}

function initials(name?: string) {
  return (name || "Huddle User")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ProfileMenu({
  user,
  navigate,
  compact = false,
}: {
  user: User | null;
  navigate: NavigateTo;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`profile-menu-wrap ${compact ? "compact" : ""}`}>
      <button
        className={compact ? "rail-avatar" : "user-footer"}
        type="button"
        aria-label="Open profile menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {compact ? (
          <>
            {initials(user?.name)}
            <i />
          </>
        ) : (
          <>
            <span className="avatar">
              {initials(user?.name)}
              <i />
            </span>
            <span>
              <strong>{user?.name ?? "Huddle user"}</strong>
              <small><i /> Online</small>
            </span>
            <ChevronDown size={16} />
          </>
        )}
      </button>
      {open && (
        <div className="profile-popup" role="menu">
          <div className="profile-popup-user">
            <strong>{user?.name ?? "Huddle user"}</strong>
            <span>{user?.email ?? "Signed in"}</span>
          </div>
          <button type="button" role="menuitem" onClick={() => navigate("/settings")}>
            <Settings size={16} /> Settings
          </button>
          <button
            type="button"
            role="menuitem"
            className="danger"
            onClick={() => {
              huddleApi.signOut();
              navigate("/login");
            }}
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

function HuddleHome({
  openWorkspace,
  navigate,
}: {
  openWorkspace: (workspaceId: number) => void;
  navigate: NavigateTo;
}) {
  const [modal, setModal] = useState<"create" | "join" | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceCode, setWorkspaceCode] = useState("");
  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(huddleApi.getCurrentUser());

  useEffect(() => {
    huddleApi
      .listWorkspaces()
      .then(setWorkspaces)
      .catch(() => setWorkspaces([]));
    huddleApi.getProfile().then(setUser).catch(() => undefined);
  }, []);

  async function enterWorkspace(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (modal === "create") {
        const workspace = await huddleApi.createWorkspace(workspaceName);
        openWorkspace(workspace.id);
      } else {
        const workspaceId = Number(workspaceCode);
        if (!Number.isInteger(workspaceId) || workspaceId < 1) {
          throw new Error("Enter a valid numeric workspace ID.");
        }
        await huddleApi.joinWorkspace(workspaceId);
        openWorkspace(workspaceId);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
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
        <ProfileMenu user={user} navigate={navigate} compact />
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
            <p>
              {workspaces.length
                ? "Choose a huddle to continue collaborating"
                : "You do not belong to any huddles yet"}
            </p>
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
            {workspaces.map((workspace) => (
              <button
                className="secondary-button"
                key={workspace.id}
                onClick={() => openWorkspace(workspace.id)}
              >
                Open {workspace.name}
              </button>
            ))}
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
                : "Enter the workspace ID your teammate shared with you."}
            </p>
            {error && (
              <div className="error-banner" role="alert">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
            {modal === "create" ? (
              <>
                <label>
                  <span>Workspace name</span>
                  <input
                    required
                    autoFocus
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    placeholder="Acme Team"
                  />
                </label>
                <small className="modal-hint">
                  Huddle will create a shareable workspace ID for your team.
                </small>
              </>
            ) : (
              <label>
                <span>Workspace ID</span>
                <input
                  required
                  autoFocus
                  value={workspaceCode}
                  onChange={(event) => setWorkspaceCode(event.target.value)}
                  placeholder="e.g. 12"
                  inputMode="numeric"
                />
              </label>
            )}
            <button
              className="primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Please wait…"
                : modal === "create"
                  ? "Create workspace"
                  : "Join workspace"}
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

function Welcome({ navigate }: { navigate: NavigateTo }) {
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
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>
            <button
              className="secondary-button"
              onClick={() => navigate("/login")}
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

function Workspace() {
  const navigate = useNavigate();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);
  const routeChannelId = Number(params.channelId);
  const [workspace, setWorkspace] = useState<WorkspaceType | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [draft, setDraft] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channelState, setChannelState] = useState<"loading" | "ready" | "error">("loading");
  const [sending, setSending] = useState(false);
  const [channelModal, setChannelModal] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [modalError, setModalError] = useState("");
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<User | null>(huddleApi.getCurrentUser());
  const channel = useMemo(
    () => channels.find((item) => item.id === routeChannelId) ?? null,
    [channels, routeChannelId],
  );
  const visibleMessages = useMemo(
    () => channel ? messages.filter((message) => message.channelId === channel.id) : [],
    [messages, channel],
  );

  useEffect(() => {
    if (!Number.isInteger(workspaceId) || workspaceId < 1) {
      navigate("/workspaces", { replace: true });
      return;
    }
    Promise.all([huddleApi.listWorkspaces(), huddleApi.listChannels(workspaceId)])
      .then(([workspaces, items]) => {
        setWorkspace(workspaces.find((item) => item.id === workspaceId) ?? null);
        setChannels(items);
        if (!Number.isInteger(routeChannelId) || !items.some((item) => item.id === routeChannelId)) {
          const first = items.find((item) => item.name === "general") ?? items[0];
          if (first) navigate(`/workspaces/${workspaceId}/channels/${first.id}`, { replace: true });
        }
      })
      .catch(() => setChannelState("error"));
    huddleApi.getProfile().then(setUser).catch(() => undefined);
  }, [workspaceId]);

  async function loadChannel() {
    if (!channel) return;
    setChannelState("loading");
    try {
      const loaded = await huddleApi.loadMessages(channel.id);
      setMessages((current) => [
        ...current.filter((message) => message.channelId !== channel.id),
        ...loaded,
      ]);
      setChannelState("ready");
    } catch {
      setChannelState("error");
    }
  }

  useEffect(() => {
    void loadChannel();
  }, [channel?.id]);

  useEffect(() => {
    if (!channel) return;
    return huddleApi.subscribeToMessages(channel.id, (message) => {
      setMessages((current) => {
        const existingIndex = current.findIndex((item) => item.id === message.id);
        if (existingIndex === -1) return [...current, message];
        const next = [...current];
        next[existingIndex] = message;
        return next;
      });
    });
  }, [channel?.id]);

  async function selectChannel(item: Channel) {
    try {
      await huddleApi.joinChannel(item.id);
      navigate(`/workspaces/${workspaceId}/channels/${item.id}`);
      setMobileOpen(false);
    } catch (cause) {
      setChannelState("error");
      setModalError(cause instanceof Error ? cause.message : "Unable to open channel.");
    }
  }

  async function createChannel(event: FormEvent) {
    event.preventDefault();
    setCreatingChannel(true);
    setModalError("");
    try {
      const created = await huddleApi.createChannel(workspaceId, channelName, channelDescription);
      setChannels((current) => [...current, created]);
      setChannelModal(false);
      setChannelName("");
      setChannelDescription("");
      navigate(`/workspaces/${workspaceId}/channels/${created.id}`);
    } catch (cause) {
      setModalError(cause instanceof Error ? cause.message : "Unable to create channel.");
    } finally {
      setCreatingChannel(false);
    }
  }

  async function copyWorkspaceId() {
    await navigator.clipboard.writeText(String(workspaceId));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!channel || !draft.trim() || sending) return;
    setSending(true);
    try {
      const message = await huddleApi.sendMessage(channel.id, draft.trim());
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="workspace">
      <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle channels">
        {mobileOpen ? <X /> : <Menu />}
      </button>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="workspace-name">
          <button className="back-to-huddles" onClick={() => navigate("/workspaces")} aria-label="Back to huddles">
            <ArrowLeft size={18} />
          </button>
          <strong>{workspace?.name ?? "Workspace"}</strong>
          <button onClick={() => setChannelModal(true)} aria-label="Add channel"><Plus size={20} /></button>
        </div>
        <button className="workspace-id" type="button" onClick={copyWorkspaceId} title="Copy workspace ID">
          <span>Workspace ID: <strong>{workspaceId}</strong></span>
          {copied ? <small>Copied!</small> : <Copy size={14} />}
        </button>
        <p className="section-label">CHANNELS</p>
        <nav>
          {channels.map((item) => (
            <button key={item.id} className={channel?.id === item.id ? "active" : ""} onClick={() => void selectChannel(item)}>
              <Hash size={14} /> {item.name}
            </button>
          ))}
        </nav>
        <button className="add-channel" onClick={() => setChannelModal(true)}>
          <Plus size={14} /> Add a channel
        </button>
        <p className="section-label">OTHERS</p>
        <button className="support"><Headphones size={15} /> Support</button>
        <ProfileMenu user={user} navigate={(path) => navigate(path)} />
      </aside>
      <section className="channel-view">
        <header className="channel-header">
          <div><Hash size={15} /><strong>{channelState === "loading" ? "Loading…" : (channel?.name ?? "Channel")}</strong></div>
          {channel?.description && <span>{channel.description}</span>}
        </header>
        <div className="message-area">
          {channelState === "loading" ? (
            <div className="channel-status"><LoaderCircle size={40} className="spinner" /><p>Loading messages…</p></div>
          ) : channelState === "error" ? (
            <div className="channel-status">
              <div className="error-banner"><AlertCircle size={20} /><span>Couldn&apos;t load this channel. Check your connection and try again.</span></div>
              <button className="retry-button" onClick={loadChannel}>Retry</button>
            </div>
          ) : visibleMessages.length === 0 && !sending ? (
            <div className="empty-state">
              <div className="empty-mark"><span /><span /><span /></div>
              <h1>{channel?.name === "general" ? <>Everyone starts in <b># general</b></> : <>Welcome to <b># {channel?.name}</b></>}</h1>
              <p>{channel?.description || (channel?.name === "general" ? "Share general information with your team here" : "This is a dedicated space for your team")}</p>
            </div>
          ) : (
            <div className="message-list">
              {visibleMessages.map((message) => {
                const own = message.authorId === user?.id;
                return (
                  <article key={message.id} className={own ? "own-message" : "other-message"}>
                    {!own && <span className="message-avatar" aria-hidden="true" />}
                    <div className="bubble-column">
                      {!own && <header><strong>{message.author}</strong><time>{message.time}</time></header>}
                      <p>{message.body}</p>
                      {own && <time>{message.time}</time>}
                    </div>
                  </article>
                );
              })}
              {sending && draft.trim() && <article className="own-message pending-message"><div className="bubble-column"><p>{draft.trim()}</p><time>Sending…</time></div></article>}
            </div>
          )}
        </div>
        <form className="composer" onSubmit={sendMessage}>
          <div>
            <input disabled={channelState !== "ready" || sending} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message #${channel?.name ?? "channel"}`} aria-label={`Message ${channel?.name ?? "channel"}`} />
            <button type="submit" aria-label="Send message" disabled={!draft.trim() || sending}>
              {sending ? <LoaderCircle size={17} className="spinner" /> : <Send size={17} fill="currentColor" />}
            </button>
          </div>
        </form>
      </section>
      {channelModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setChannelModal(false); }}>
          <form className="workspace-modal" role="dialog" aria-modal="true" aria-labelledby="channel-modal-title" onSubmit={createChannel}>
            <h2 id="channel-modal-title">Create a channel</h2>
            <p>Give conversations a focused place inside {workspace?.name ?? "this workspace"}.</p>
            {modalError && <div className="error-banner" role="alert"><AlertCircle size={20} /><span>{modalError}</span></div>}
            <label><span>Channel name</span><input required autoFocus minLength={2} maxLength={64} value={channelName} onChange={(event) => setChannelName(event.target.value)} placeholder="Product Design" /></label>
            <label><span>Description (optional)</span><input maxLength={280} value={channelDescription} onChange={(event) => setChannelDescription(event.target.value)} placeholder="What this channel is for" /></label>
            <button className="primary-button" type="submit" disabled={creatingChannel}>{creatingChannel ? "Creating…" : "Create channel"}</button>
            <button className="modal-back" type="button" onClick={() => setChannelModal(false)}>← Back</button>
          </form>
        </div>
      )}
    </main>
  );
}
function SettingsScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(huddleApi.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    huddleApi.getProfile().then(setUser).finally(() => setLoading(false));
  }, []);

  return (
    <main className="settings-screen">
      <header>
        <button onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={19} /></button>
        <img src="/figma/huddle-logo.png" alt="Huddle" />
      </header>
      <section className="settings-card">
        <div className="settings-avatar">{initials(user?.name)}</div>
        <div>
          <h1>Settings</h1>
          <p>Your account details are managed by your Huddle profile.</p>
        </div>
        <label><span>Name</span><input readOnly value={loading ? "Loading…" : (user?.name ?? "")} /></label>
        <label><span>Email</span><input readOnly value={loading ? "Loading…" : (user?.email ?? "")} /></label>
        <button className="secondary-button" onClick={() => navigate("/workspaces")}>Back to huddles</button>
      </section>
    </main>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return huddleApi.isAuthenticated() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const go = (path: string) => navigate(path);
  return (
    <Routes>
      <Route path="/" element={<Welcome navigate={go} />} />
      <Route path="/signup" element={<AuthScreen mode="signup" navigate={go} />} />
      <Route path="/signup/success" element={<SignupSuccess navigate={go} />} />
      <Route path="/login" element={<AuthScreen mode="login" navigate={go} />} />
      <Route path="/workspaces" element={<ProtectedRoute><HuddleHome navigate={go} openWorkspace={(id) => navigate(`/workspaces/${id}`)} /></ProtectedRoute>} />
      <Route path="/workspaces/:workspaceId" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
      <Route path="/workspaces/:workspaceId/channels/:channelId" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
