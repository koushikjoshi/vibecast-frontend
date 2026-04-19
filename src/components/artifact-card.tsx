"use client";

import Link from "next/link";

import { ArtifactSummary } from "@/lib/api";

const STUDIO_COLORS: Record<string, string> = {
  content: "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200",
  social: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200",
  lifecycle: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  podcast: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200",
};

const STATE_COLORS: Record<string, string> = {
  drafting: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  awaiting_approval:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200",
  changes_requested:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  shipped: "bg-emerald-200 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-100",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200",
};

const VERDICT_COLORS: Record<string, string> = {
  pass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  warn: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  block: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200",
};

export function ArtifactCard({
  slug,
  artifact,
}: {
  slug: string;
  artifact: ArtifactSummary;
}) {
  return (
    <Link
      href={`/w/${slug}/artifacts/${artifact.id}`}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
            STUDIO_COLORS[artifact.studio] ?? "bg-zinc-100 text-zinc-700"
          }`}
        >
          {artifact.studio}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
            STATE_COLORS[artifact.state] ?? "bg-zinc-100 text-zinc-700"
          }`}
        >
          {artifact.state.replace(/_/g, " ")}
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-tight">
        {artifact.title}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{artifact.type}</p>
      <div className="mt-4 flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            VERDICT_COLORS[artifact.brand_verdict] ?? "bg-zinc-100 text-zinc-700"
          }`}
        >
          brand · {artifact.brand_verdict}
        </span>
        <span className="text-[10px] text-zinc-400">
          {new Date(artifact.created_at).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
