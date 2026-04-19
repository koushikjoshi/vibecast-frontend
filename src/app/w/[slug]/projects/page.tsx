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
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Marketing Projects
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Every launch, one briefing.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
            A project is a launch, update, or campaign. Upload the docs and URLs your
            team would brief a marketing department with. VibeCast produces the full
            campaign from there.
          </p>
        </div>
        <Link href={`/w/${slug}/projects/new`}>
          <Button size="lg">New Project</Button>
        </Link>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="h-28 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-sm font-medium">No projects yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Start your first marketing project to see the 4-studio pipeline in action.
          </p>
          <Link href={`/w/${slug}/projects/new`} className="mt-5 inline-block">
            <Button>Start a Project</Button>
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={`/w/${slug}/projects/${p.id}`}
                className="block rounded-lg border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-500"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{p.name}</p>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {p.state}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  {p.launch_date ? `Launch: ${p.launch_date}` : "No launch date set"} ·
                  Created {new Date(p.created_at).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
