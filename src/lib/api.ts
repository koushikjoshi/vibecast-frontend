// We always talk to the backend through the Next.js rewrite proxy
// (/api/backend/* → FastAPI). This keeps the browser on HTTPS even though
// the backend is served over plain HTTP, so no mixed-content blocking.
// Override with NEXT_PUBLIC_BACKEND_URL only for local dev against a
// running FastAPI on a different origin.
export const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "/api/backend";

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

export type CampaignPlan = {
  id: string;
  project_id: string;
  version: number;
  positioning: string;
  pillars: {
    name: string;
    message: string;
    proof_points: string[];
  }[];
  audience_refinement: string;
  channel_selection: {
    channel: string;
    rationale: string;
    expected_impact: "high" | "medium" | "low";
  }[];
  competitor_angle: string;
  urgency_framing: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
};

export type RunKickoff = {
  run_id: string;
  project_id: string;
  status: string;
};

export type ProjectRun = {
  id: string;
  phase: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  total_cost_usd: number;
  error: string | null;
};

export type RunStep = {
  id: string;
  agent: string;
  tool: string | null;
  status: string;
  model: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  cost_usd: number | null;
  duration_ms: number | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  started_at: string;
  ended_at: string | null;
};

export type RunDetail = {
  id: string;
  project_id: string;
  phase: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  total_tokens_in: number;
  total_tokens_out: number;
  total_cost_usd: number;
  error: string | null;
  steps: RunStep[];
};

export type ArtifactSummary = {
  id: string;
  project_id: string;
  studio: "content" | "social" | "lifecycle" | "podcast";
  type: string;
  state: string;
  title: string;
  brand_verdict: "pass" | "warn" | "block" | string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArtifactDetail = ArtifactSummary & {
  content: Record<string, unknown>;
  brand_check: {
    verdict: string;
    findings?: {
      verdict: string;
      rule: string;
      note: string;
      section_ref?: string;
      suggested_rewrite?: string | null;
    }[];
  };
};

export type ArtifactCatalogEntry = {
  type: string;
  studio: string;
  title: string;
  description: string;
};

async function requestForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: form,
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

  kickoffPlanning: (slug: string, projectId: string) =>
    request<RunKickoff>(`/w/${slug}/projects/${projectId}/plan`, { method: "POST" }),
  getLatestPlan: (slug: string, projectId: string) =>
    request<CampaignPlan | null>(`/w/${slug}/projects/${projectId}/plan`),
  approvePlan: (slug: string, projectId: string) =>
    request<CampaignPlan>(`/w/${slug}/projects/${projectId}/plan/approve`, {
      method: "POST",
    }),
  listProjectRuns: (slug: string, projectId: string) =>
    request<ProjectRun[]>(`/w/${slug}/projects/${projectId}/runs`),

  getRun: (slug: string, runId: string) =>
    request<RunDetail>(`/w/${slug}/runs/${runId}`),

  runEventsUrl: (slug: string, runId: string) =>
    `${API_BASE}/w/${slug}/runs/${runId}/events`,

  kickoffProducing: (
    slug: string,
    projectId: string,
    types?: string[],
  ) =>
    request<{ run_id: string; project_id: string; status: string; types: string[] }>(
      `/w/${slug}/projects/${projectId}/produce`,
      {
        method: "POST",
        body: JSON.stringify({ types: types ?? null }),
      },
    ),
  listProjectArtifacts: (slug: string, projectId: string) =>
    request<ArtifactSummary[]>(`/w/${slug}/projects/${projectId}/artifacts`),
  getProjectArtifactCatalog: (slug: string, projectId: string) =>
    request<ArtifactCatalogEntry[]>(
      `/w/${slug}/projects/${projectId}/artifact-catalog`,
    ),
  getArtifact: (slug: string, artifactId: string) =>
    request<ArtifactDetail>(`/w/${slug}/artifacts/${artifactId}`),
  resetProject: (slug: string, projectId: string) =>
    request<{
      project_id: string;
      state: string;
      deleted_artifacts: number;
      deleted_runs: number;
      plan_cleared: boolean;
    }>(`/w/${slug}/projects/${projectId}/reset`, { method: "POST" }),
  approveArtifact: (slug: string, artifactId: string, comment?: string) =>
    request<ArtifactDetail>(`/w/${slug}/artifacts/${artifactId}/approve`, {
      method: "POST",
      body: JSON.stringify({ comment: comment ?? null }),
    }),
  requestArtifactChanges: (slug: string, artifactId: string, comment?: string) =>
    request<ArtifactDetail>(
      `/w/${slug}/artifacts/${artifactId}/request-changes`,
      {
        method: "POST",
        body: JSON.stringify({ comment: comment ?? null }),
      },
    ),
  approvalQueue: (slug: string) =>
    request<
      {
        artifact: ArtifactSummary;
        project_id: string;
        project_name: string;
        project_slug: string;
      }[]
    >(`/w/${slug}/approval`),
};

