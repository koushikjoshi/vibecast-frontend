"use client";

import { use, useCallback, useEffect, useState } from "react";

import {
  ApiError,
  ArtifactSummary,
  CampaignPlan,
  ProjectDetail,
  ProjectRun,
  api,
} from "@/lib/api";
import { ArtifactCard } from "@/components/artifact-card";
import { Button } from "@/components/ui/button";
import { CampaignPlanView } from "@/components/campaign-plan-view";
import { LiveTrace } from "@/components/live-trace";

function stateBadgeClass(state: string): string {
  switch (state) {
    case "intake":
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    case "planning":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200";
    case "plan_ready":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200";
    case "producing":
      return "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200";
    case "reviewing":
      return "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200";
    case "shipped":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

const PIPELINE_STATES = [
  "intake",
  "planning",
  "plan_ready",
  "producing",
  "reviewing",
  "shipped",
] as const;

function StateProgress({ state }: { state: string }) {
  const currentIdx = Math.max(
    0,
    PIPELINE_STATES.findIndex((s) => s === state),
  );
  return (
    <div className="flex w-full items-center gap-2">
      {PIPELINE_STATES.map((s, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  active
                    ? "text-zinc-900 dark:text-zinc-50"
                    : done
                    ? "text-zinc-500"
                    : "text-zinc-300 dark:text-zinc-600"
                }`}
              >
                {s.replace("_", " ")}
              </span>
              <div
                className={`h-1 rounded-full ${
                  done
                    ? "bg-zinc-900 dark:bg-zinc-50"
                    : active
                    ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500"
                    : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [plan, setPlan] = useState<CampaignPlan | null>(null);
  const [runs, setRuns] = useState<ProjectRun[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactSummary[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [kickoffPending, setKickoffPending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [producing, setProducing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [p, pl, rs, arts] = await Promise.all([
      api.getProject(slug, id),
      api.getLatestPlan(slug, id),
      api.listProjectRuns(slug, id),
      api.listProjectArtifacts(slug, id),
    ]);
    setProject(p);
    setPlan(pl);
    setRuns(rs);
    setArtifacts(arts);
    const running = rs.find((r) => r.status === "running");
    if (running) setActiveRunId(running.id);
    else setActiveRunId(null);
  }, [slug, id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to load project.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const handleKickoff = async () => {
    setError(null);
    setKickoffPending(true);
    try {
      const kickoff = await api.kickoffPlanning(slug, id);
      setActiveRunId(kickoff.run_id);
      await refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to start planning run.");
    } finally {
      setKickoffPending(false);
    }
  };

  const handleTraceComplete = useCallback(
    async (status: "succeeded" | "failed") => {
      if (status === "succeeded") {
        await refresh();
      } else {
        setError("The planning run failed. Check the trace for details.");
        await refresh();
      }
    },
    [refresh],
  );

  const handleApprove = async () => {
    if (!plan) return;
    setApproving(true);
    setError(null);
    try {
      const approved = await api.approvePlan(slug, id);
      setPlan(approved);
      await refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Approval failed.");
    } finally {
      setApproving(false);
    }
  };

  const handleProduce = async () => {
    setError(null);
    setProducing(true);
    try {
      const kickoff = await api.kickoffProducing(slug, id);
      setActiveRunId(kickoff.run_id);
      await refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to start producing run.");
    } finally {
      setProducing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-lg border border-dashed border-red-300 p-6 text-sm text-red-600">
        {error ?? "Project not found."}
      </div>
    );
  }

  const canKickoff =
    ["intake", "planning", "plan_ready"].includes(project.state) &&
    !activeRunId &&
    plan === null;
  const canApprove =
    plan !== null &&
    plan.approved_at === null &&
    project.state === "plan_ready";
  const canProduce =
    plan !== null &&
    plan.approved_at !== null &&
    !activeRunId &&
    ["producing", "reviewing", "plan_ready"].includes(project.state) &&
    artifacts.length === 0;

  // The single next action the user should take. Used to drive the
  // "what do I click?" banner so the page is navigable at a glance.
  const nextAction: {
    title: string;
    description: string;
    cta: string;
    onClick: () => void;
    loading: boolean;
  } | null = canKickoff
    ? {
        title: "Start planning",
        description:
          "Your CMO agent will read the sources, research competitors on the live web, and submit a Campaign Plan for your review. ~40 seconds.",
        cta: "Run planning",
        onClick: handleKickoff,
        loading: kickoffPending,
      }
    : canApprove
    ? {
        title: "Review & approve the plan",
        description:
          "The plan below is the brief every downstream artifact will use. Approve it to unlock all 12 production artifacts.",
        cta: "Approve plan",
        onClick: handleApprove,
        loading: approving,
      }
    : canProduce
    ? {
        title: "Produce all 12 artifacts",
        description:
          "Blog, press, release notes, X thread, LinkedIn × 2, HN, Product Hunt, 2 emails, battle card, podcast. Drafted by specialist agents, brand-checked, streamed live.",
        cta: "Produce artifacts",
        onClick: handleProduce,
        loading: producing,
      }
    : null;

  return (
    <div className="flex flex-col gap-12">
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Marketing Project
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Launch: {project.launch_date ?? "—"} · State:{" "}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${stateBadgeClass(
                project.state,
              )}`}
            >
              {project.state}
            </span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {plan?.approved_at && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              Plan approved · {new Date(plan.approved_at).toLocaleString()}
            </span>
          )}
          {artifacts.length > 0 && (
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200">
              {artifacts.length} artifact{artifacts.length === 1 ? "" : "s"} drafted
            </span>
          )}
        </div>
      </header>

      <StateProgress state={project.state} />

      {nextAction && !activeRunId && (
        <section className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-zinc-950 dark:to-violet-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                Next step
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {nextAction.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                {nextAction.description}
              </p>
            </div>
            <Button
              size="lg"
              onClick={nextAction.onClick}
              loading={nextAction.loading}
            >
              {nextAction.cta}
            </Button>
          </div>
        </section>
      )}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {activeRunId && (
        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Current run
          </p>
          <LiveTrace
            slug={slug}
            runId={activeRunId}
            onComplete={handleTraceComplete}
          />
        </section>
      )}

      {plan && (
        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Campaign plan
          </p>
          <CampaignPlanView plan={plan} />
        </section>
      )}

      {artifacts.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Artifacts ({artifacts.length})
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {artifacts.map((a) => (
              <ArtifactCard key={a.id} slug={slug} artifact={a} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Sources ({project.sources.length})
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {project.sources.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {s.type}
                </span>
                <span className="text-xs text-zinc-400">
                  {new Date(s.created_at).toLocaleString()}
                </span>
              </div>
              {s.type === "url" ? (
                <a
                  href={s.raw_input}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block truncate text-sm text-zinc-900 hover:underline dark:text-zinc-100"
                >
                  {s.raw_input}
                </a>
              ) : s.type === "brief_text" ? (
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  Inline brief ({s.has_normalized_text ? "text ingested" : "empty"})
                </p>
              ) : (
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {s.raw_input}{" "}
                  {s.has_normalized_text && (
                    <span className="text-xs text-zinc-500">· text extracted</span>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {runs.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Run history
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {runs.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
                      r.status === "running"
                        ? "bg-indigo-100 text-indigo-800"
                        : r.status === "succeeded"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {r.phase} · {r.status}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(r.started_at).toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  ${r.total_cost_usd.toFixed(4)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
