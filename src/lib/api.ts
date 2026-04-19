export const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export type MembershipOut = {
  workspace_id: string;
  workspace_slug: string;
  workspace_name: string;
  role: string;
};

export type MeOut = {
  id: string;
  email: string;
  name: string | null;
  memberships: MembershipOut[];
};

export type WorkspaceOut = {
  id: string;
  slug: string;
  name: string;
  brand_preset: string;
  role: string;
};

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown, message: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }
  if (!res.ok) {
    const detail =
      parsed && typeof parsed === "object" && parsed !== null && "detail" in parsed
        ? (parsed as { detail: unknown }).detail
        : parsed;
    const message =
      typeof detail === "string" ? detail : `Request failed with ${res.status}`;
    throw new ApiError(res.status, detail, message);
  }
  return parsed as T;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  return handle<T>(res);
}

export const api = {
  requestMagicLink: (email: string) =>
    request<void>("/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  consumeMagicLink: (token: string) =>
    request<MeOut>("/auth/magic-link/consume", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<MeOut>("/me"),
  createWorkspace: (payload: {
    name: string;
    slug?: string;
    brand_preset: string;
  }) =>
    request<WorkspaceOut>("/workspaces", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getWorkspace: (slug: string) => request<WorkspaceOut>(`/w/${slug}`),
};
