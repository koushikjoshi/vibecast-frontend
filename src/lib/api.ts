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

export type BrandKitOut = {
  id: string;
  version: number;
  preset: string;
  tone: Record<string, unknown>;
  banned_phrases: string[];
  required_disclaimers: string[];
  competitor_policy: "blocked" | "name-only" | "comparative-ok";
  pronunciation: Record<string, unknown>[];
  legal_footer: string;
  positioning: string;
  target_icp: string;
  voice_samples: Record<string, unknown>[];
  created_at: string;
};

export type BrandKitUpdate = Partial<{
  preset: string;
  tone: Record<string, unknown>;
  banned_phrases: string[];
  required_disclaimers: string[];
  competitor_policy: "blocked" | "name-only" | "comparative-ok";
  pronunciation: Record<string, unknown>[];
  legal_footer: string;
  positioning: string;
  target_icp: string;
  voice_samples: Record<string, unknown>[];
}>;

export type CompetitorOut = {
  id: string;
  name: string;
  website_url: string;
  pricing_url: string | null;
  changelog_url: string | null;
  positioning_cached: string | null;
  research: Record<string, unknown> | null;
  last_fetched_at: string | null;
  created_at: string;
};

export type ProjectSummary = {
  id: string;
  slug: string;
  name: string;
  launch_date: string | null;
  state: string;
  target_competitor_id: string | null;
  created_at: string;
};

export type ProjectSource = {
  id: string;
  type: string;
  raw_input: string;
  storage_path: string | null;
  has_normalized_text: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type ProjectDetail = ProjectSummary & {
  sources: ProjectSource[];
};

async function requestForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: form,
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

  getBrandKit: (slug: string) => request<BrandKitOut>(`/w/${slug}/brand`),
  listBrandVersions: (slug: string) =>
    request<BrandKitOut[]>(`/w/${slug}/brand/versions`),
  updateBrandKit: (slug: string, payload: BrandKitUpdate) =>
    request<BrandKitOut>(`/w/${slug}/brand`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listCompetitors: (slug: string) =>
    request<CompetitorOut[]>(`/w/${slug}/competitors`),
  createCompetitor: (
    slug: string,
    payload: {
      name: string;
      website_url: string;
      pricing_url?: string | null;
      changelog_url?: string | null;
    },
  ) =>
    request<CompetitorOut>(`/w/${slug}/competitors`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteCompetitor: (slug: string, competitorId: string) =>
    request<void>(`/w/${slug}/competitors/${competitorId}`, { method: "DELETE" }),

  listProjects: (slug: string) =>
    request<ProjectSummary[]>(`/w/${slug}/projects`),
  getProject: (slug: string, projectId: string) =>
    request<ProjectDetail>(`/w/${slug}/projects/${projectId}`),
  createProject: (slug: string, form: FormData) =>
    requestForm<ProjectDetail>(`/w/${slug}/projects`, form),
};

