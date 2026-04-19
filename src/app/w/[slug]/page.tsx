"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { api, ProjectSummary } from "@/lib/api";

type Status = {
  hasBrand: boolean;
  competitorCount: number;
  projects: ProjectSummary[];
};

export default function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [brand, competitors, projects] = await Promise.all([
        api.getBrandKit(slug).catch(() => null),
        api.listCompetitors(slug).catch(() => []),
        api.listProjects(slug).catch(() => []),
      ]);
      if (cancelled) return;
      setStatus({
        hasBrand: brand !== null,
        competitorCount: competitors.length,
        projects,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const setupItems = [
    {
      title: "Brand Kit",
      body: "Voice, banned phrases, required disclaimers. Every agent respects this.",
      href: `/w/${slug}/brand`,
      done: status?.hasBrand ?? false,
    },
    {
      title: "Competitors",
      body: "We run live research on each so your positioning is grounded in evidence.",
      href: `/w/${slug}/competitors`,
      done: (status?.competitorCount ?? 0) > 0,
      meta:
        (status?.competitorCount ?? 0) > 0
          ? `${status!.competitorCount} tracked`
          : undefined,
    },
    {
      title: "Marketing Project",
      body: "Upload a brief. The CMO runs a full 12-artifact pipeline from there.",
      href: `/w/${slug}/projects`,
      done: (status?.projects.length ?? 0) > 0,
      meta:
        (status?.projects.length ?? 0) > 0
          ? `${status!.projects.length} active`
          : undefined,
    },
  ];

  const completed = setupItems.filter((s) => s.done).length;
  const pct = Math.round((completed / setupItems.length) * 100);

  const recent = (status?.projects ?? []).slice(0, 3);

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Overview
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Welcome to your workspace.
        </h1>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
          VibeCast is a multi-agent marketing team for your next launch. Here&apos;s
          where you stand.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Setup
            </p>
            <p className="mt-1 text-base font-medium">
              {completed === setupItems.length
                ? "Workspace ready — kick off a run."
                : `${completed} of ${setupItems.length} complete`}
            </p>
          </div>
          <span className="font-mono text-xs text-zinc-500">{pct}%</span>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {setupItems.map((item, idx) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group flex flex-col rounded-xl border p-4 transition-colors ${
                item.done
                  ? "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                  : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  Step {idx + 1}
                </span>
                {item.done ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Done
                    {item.meta && (
                      <span className="font-normal normal-case text-emerald-100">
                        · {item.meta}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    Pending
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
              <p className="mt-1 flex-1 text-xs text-zinc-600 dark:text-zinc-400">
                {item.body}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-zinc-900 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-50">
                Open
                <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Recent projects
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Pick up where you left off.
              </h2>
            </div>
            <Link
              href={`/w/${slug}/projects`}
              className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              All projects →
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((p) => (
              <Link
                key={p.id}
                href={`/w/${slug}/projects/${p.id}`}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${stateBadge(
                      p.state,
                    )}`}
                  >
                    {p.state.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {p.launch_date ? `Launch ${p.launch_date}` : "no date"}
                  </span>
                </div>
                <p className="mt-3 font-semibold">{p.name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Created {new Date(p.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {status && recent.length === 0 && (
        <section className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-sm font-medium">No projects yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Start your first project to see the 4-studio agent pipeline in action.
          </p>
          <Link
            href={`/w/${slug}/projects/new`}
            className="mt-5 inline-flex h-10 items-center rounded-md bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
          >
            Start a Project
          </Link>
        </section>
      )}
    </div>
  );
}

function stateBadge(state: string): string {
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
