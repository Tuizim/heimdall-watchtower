// Typed API client — drop-in replacement for the Supabase client.
// All requests go to /api/* on the same origin (no CORS needed).

const BASE = "/api";

// Global error bus — listeners (e.g. App.tsx toast) subscribe to this
type ErrorListener = (message: string, status: number) => void;
const _errorListeners: ErrorListener[] = [];
export function onApiError(fn: ErrorListener): () => void {
  _errorListeners.push(fn);
  return () => {
    const idx = _errorListeners.indexOf(fn);
    if (idx !== -1) _errorListeners.splice(idx, 1);
  };
}
function emitError(message: string, status: number) {
  _errorListeners.forEach(fn => fn(message, status));
}

let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ─── Low-level fetch helper ───────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retried = false
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (_accessToken) headers["Authorization"] = `Bearer ${_accessToken}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: "include", // sends the refresh_token HttpOnly cookie
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401 only when there's an active session (expired token, not bad credentials)
  if (res.status === 401 && !retried && _accessToken) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(method, path, body, true);
    setAccessToken(null);
    throw new ApiError(401, "Sessão expirada.");
  }

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const message = json?.error ?? "Erro desconhecido.";
    const err = new ApiError(res.status, message);
    // Don't toast 401 login failures — the form handles those inline
    if (res.status !== 401) emitError(message, res.status);
    throw err;
  }

  return res.json() as Promise<T>;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const { accessToken } = await res.json();
    setAccessToken(accessToken);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  async login(login: string, password: string) {
    const data = await request<{ accessToken: string; user: Profile }>("POST", "/auth/login", { login, password });
    setAccessToken(data.accessToken);
    return data;
  },

  async logout() {
    await request("POST", "/auth/logout").catch(() => {});
    setAccessToken(null);
  },

  async me(): Promise<Profile | null> {
    try {
      return await request<Profile>("GET", "/auth/me");
    } catch {
      return null;
    }
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return request("PUT", "/auth/password", { currentPassword, newPassword });
  },

  async refresh(): Promise<string | null> {
    const ok = await tryRefresh();
    return ok ? _accessToken : null;
  },
};

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const profiles = {
  list: () => request<Profile[]>("GET", "/profiles"),
  get: (id: string) => request<Profile>("GET", `/profiles/${id}`),
  update: (id: string, data: Partial<Pick<Profile, "nome" | "avatar_url" | "classe_viking" | "papel">>) =>
    request<Profile>("PUT", `/profiles/${id}`, data),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasks = {
  list: () => request<Task[]>("GET", "/tasks"),
  get: (id: string) => request<Task>("GET", `/tasks/${id}`),
  create: (data: TaskInput) => request<Task>("POST", "/tasks", data),
  update: (id: string, data: Partial<TaskInput>) => request<Task>("PUT", `/tasks/${id}`, data),
  delete: (id: string) => request("DELETE", `/tasks/${id}`),
  deleteAll: () => request("DELETE", "/tasks"),
};

// ─── Branches ─────────────────────────────────────────────────────────────────

export const branches = {
  list: () => request<Branch[]>("GET", "/branches"),
  create: (data: BranchInput) => request<Branch>("POST", "/branches", data),
  update: (id: string, data: Partial<BranchInput>) => request<Branch>("PUT", `/branches/${id}`, data),
  delete: (id: string) => request("DELETE", `/branches/${id}`),
};

// ─── Retro ────────────────────────────────────────────────────────────────────

export const retro = {
  list: () => request<RetroCard[]>("GET", "/retro"),
  create: (data: RetroCardInput) => request<RetroCard>("POST", "/retro", data),
  update: (id: string, data: Partial<RetroCardInput>) => request<RetroCard>("PUT", `/retro/${id}`, data),
  delete: (id: string) => request("DELETE", `/retro/${id}`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const admin = {
  listUsers: () => request<Profile[]>("GET", "/admin/users"),
  createUser: (data: CreateUserInput) => request<Profile>("POST", "/admin/users", data),
  updateUser: (id: string, data: Partial<CreateUserInput>) => request<Profile>("PUT", `/admin/users/${id}`, data),
  deleteUser: (id: string) => request("DELETE", `/admin/users/${id}`),
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  nome: string;
  email: string;
  login?: string;
  avatar_url?: string;
  classe_viking: string;
  papel: string;
  role: "admin" | "user";
  xp: number;
  created_at: string;
}

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  pontos: number;
  dias_estimados: number;
  data_prevista?: string;
  status: string;
  responsavel_id?: string;
  created_at: string;
}

export interface TaskInput {
  titulo: string;
  descricao?: string;
  pontos?: number;
  dias_estimados?: number;
  data_prevista?: string;
  status?: string;
  responsavel_id?: string;
}

export interface Branch {
  id: string;
  nome_branch: string;
  responsavel_id?: string;
  ultimo_update: string;
  status: string;
  observacao?: string;
}

export interface BranchInput {
  nome_branch: string;
  responsavel_id?: string;
  status?: string;
  observacao?: string;
}

export interface RetroCard {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  responsavel_id?: string;
  created_at: string;
}

export interface RetroCardInput {
  titulo: string;
  descricao?: string;
  status?: string;
  responsavel_id?: string;
}

export interface CreateUserInput {
  nome: string;
  login: string;
  password?: string;
  email?: string;
  papel?: string;
  classe_viking?: string;
  role?: "admin" | "user";
  xp?: number;
  avatar_url?: string;
}
