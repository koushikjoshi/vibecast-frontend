"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { ApiError, ProjectSummary, api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function ProjectsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [items, setItems] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.listProjects(slug);
        if (cancelled) return;
        setItems(data);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to load projects.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Marketing Projects
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Every launch, one briefing.
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Upload the docs and URLs your team would brief a marketing
            department with. VibeCast produces the full campaign from there.
          </p>
        </div>
        <Link href={`/w/${slug}/projects/new`}>
          <Button size="lg">New Project</Button>
        </Link>
      </header>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-sm font-medium">No projects yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Start your first marketing project to see the 4-studio pipeline in action.
          </p>
          <Link href={`/w/${slug}/projects/new`} className="mt-5 inline-block">
            <Button>Start a Project</Button>
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={`/w/${slug}/projects/${p.id}`}
                className="group flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${stateBadge(
                      p.state,
                    )}`}
                  >
                    {p.state.replace("_", " ")}
                  </span>
                  <LaunchCountdown date={p.launch_date ?? null} />
                </div>
                <p className="mt-3 text-base font-semibold leading-tight">
                  {p.name}
                </p>
                <p className="mt-2 flex-1 text-xs text-zinc-500">
                  Created {new Date(p.created_at).toLocaleDateString()}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{p.slug}</span>
                  <span className="font-medium text-zinc-900 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-50">
                    Open →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LaunchCountdown({ date }: { date: string | null }) {
  if (!date) {
    return <span className="text-[10px] text-zinc-400">no launch date</span>;
  }
  const d = new Date(date);
  const now = new Date();
  const days = Math.round(
    (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  let label: string;
  let color: string;
  if (days < 0) {
    label = `shipped ${-days}d ago`;
    color = "text-zinc-400";
  } else if (days === 0) {
    label = "launches today";
    color = "text-rose-600 dark:text-rose-400";
  } else if (days <= 7) {
    label = `in ${days}d`;
    color = "text-amber-600 dark:text-amber-400";
  } else {
    label = `in ${days}d`;
    color = "text-zinc-500";
  }
  return <span className={`text-[10px] font-medium ${color}`}>{label}</span>;
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
