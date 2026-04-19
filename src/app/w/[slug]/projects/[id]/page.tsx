"use client";

import { use, useEffect, useState } from "react";

import { ApiError, ProjectDetail, api } from "@/lib/api";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await api.getProject(slug, id);
        if (cancelled) return;
        setProject(p);
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
  }, [slug, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-lg border border-dashed border-red-300 p-6 text-sm text-red-600">
        {error ?? "Project not found."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Marketing Project
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{project.name}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Launch: {project.launch_date ?? "—"} · State:{" "}
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            {project.state}
          </span>
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Sources ({project.sources.length})
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
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

      <section className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">
        <p className="font-medium text-zinc-700 dark:text-zinc-200">
          Next: kick off the Campaign Planning run.
        </p>
        <p className="mt-1">
          Once the CMO + Research + Strategy agents are wired (Phase 3), hit “Run
          planning” to see the campaign plan appear with a live trace of every agent,
          tool call, and citation.
        </p>
      </section>
    </div>
  );
}
