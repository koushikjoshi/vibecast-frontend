"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { ApiError, ArtifactSummary, api } from "@/lib/api";
import { ArtifactCard } from "@/components/artifact-card";

type QueueItem = {
  artifact: ArtifactSummary;
  project_id: string;
  project_name: string;
  project_slug: string;
};

export default function ApprovalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.approvalQueue(slug);
        if (cancelled) return;
        setItems(data);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to load approval queue.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const grouped = items.reduce<Record<string, QueueItem[]>>((acc, item) => {
    acc[item.project_id] ??= [];
    acc[item.project_id].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Approval queue
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {items.length} artifact{items.length === 1 ? "" : "s"} awaiting you.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
          Everything your agents have drafted and passed through the Brand
          Guardian, grouped by project. Approve to ship. Request changes to
          send it back to the studio.
        </p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="h-28 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-sm font-medium">Inbox zero.</p>
          <p className="mt-1 text-sm text-zinc-500">
            No artifacts are waiting for review. Kick off a project from the
            Projects tab to see new drafts land here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {Object.entries(grouped).map(([projectId, projectItems]) => {
            const first = projectItems[0];
            return (
              <section key={projectId}>
                <Link
                  href={`/w/${slug}/projects/${projectId}`}
                  className="text-sm font-semibold hover:underline"
                >
                  {first.project_name}
                </Link>
                <p className="text-xs text-zinc-500">
                  {projectItems.length} artifact(s)
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {projectItems.map((item) => (
                    <ArtifactCard
                      key={item.artifact.id}
                      slug={slug}
                      artifact={item.artifact}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
