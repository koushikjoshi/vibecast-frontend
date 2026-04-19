"use client";

import Link from "next/link";
import React, { use, useCallback, useEffect, useState } from "react";

import { ApiError, ArtifactDetail, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STUDIO_COLORS: Record<string, string> = {
  content: "bg-sky-100 text-sky-800",
  social: "bg-amber-100 text-amber-800",
  lifecycle: "bg-emerald-100 text-emerald-800",
  podcast: "bg-violet-100 text-violet-800",
};

const STATE_COLORS: Record<string, string> = {
  drafting: "bg-zinc-100 text-zinc-700",
  awaiting_approval: "bg-indigo-100 text-indigo-800",
  changes_requested: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  shipped: "bg-emerald-200 text-emerald-900",
  rejected: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
};

function renderValue(value: unknown, depth = 0): React.ReactElement {
  if (value === null || value === undefined) {
    return <span className="text-zinc-400">—</span>;
  }
  if (typeof value === "string") {
    const isMultiline = value.includes("\n") || value.length > 120;
    return (
      <p className={`whitespace-pre-wrap ${isMultiline ? "" : ""}`}>{value}</p>
    );
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return <span>{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-zinc-400">[]</span>;
    }
    const allStrings = value.every((v) => typeof v === "string");
    if (allStrings) {
      return (
        <ul className="ml-4 list-disc space-y-1 text-sm">
          {(value as string[]).map((v, i) => (
            <li key={i} className="whitespace-pre-wrap">
              {v}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <ul className="flex flex-col gap-3">
        {value.map((item, i) => (
          <li
            key={i}
            className="rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            {renderValue(item, depth + 1)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <dl className="flex flex-col gap-2 text-sm">
        {entries.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {k.replace(/_/g, " ")}
            </dt>
            <dd className="mt-0.5">{renderValue(v, depth + 1)}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return <span>{String(value)}</span>;
}

export default function ArtifactDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const [artifact, setArtifact] = useState<ArtifactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState<null | "approve" | "changes">(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getArtifact(slug, id);
      setArtifact(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to load artifact.");
    } finally {
      setLoading(false);
    }
  }, [slug, id]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (action: "approve" | "changes") => {
    setError(null);
    setPending(action);
    try {
      const updated =
        action === "approve"
          ? await api.approveArtifact(slug, id, comment || undefined)
          : await api.requestArtifactChanges(slug, id, comment || undefined);
      setArtifact(updated);
      setComment("");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Action failed.");
    } finally {
      setPending(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="rounded-lg border border-dashed border-red-300 p-6 text-sm text-red-600">
        {error ?? "Artifact not found."}
      </div>
    );
  }

  const canAct = [
    "awaiting_approval",
    "changes_requested",
  ].includes(artifact.state);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Link
          href={`/w/${slug}/projects/${artifact.project_id}`}
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Back to project
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
              STUDIO_COLORS[artifact.studio] ?? "bg-zinc-100 text-zinc-700"
            }`}
          >
            {artifact.studio}
          </span>
          <span className="text-xs text-zinc-500">{artifact.type}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
              STATE_COLORS[artifact.state] ?? "bg-zinc-100 text-zinc-700"
            }`}
          >
            {artifact.state.replace(/_/g, " ")}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {artifact.title}
        </h1>
      </header>

      {artifact.brand_check && (
        <section
          className={`rounded-lg border p-4 text-sm ${
            artifact.brand_check.verdict === "pass"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : artifact.brand_check.verdict === "warn"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider">
            Brand Guardian · {artifact.brand_check.verdict}
          </p>
          {artifact.brand_check.findings?.length ? (
            <ul className="mt-2 space-y-1 text-xs">
              {artifact.brand_check.findings.map((f, i) => (
                <li key={i}>
                  <span className="font-mono">[{f.rule}]</span> {f.note}
                  {f.section_ref ? (
                    <span className="ml-2 text-[10px] opacity-70">
                      @ {f.section_ref}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs opacity-80">
              No brand issues detected.
            </p>
          )}
        </section>
      )}

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {renderValue(artifact.content)}
      </section>

      {canAct && (
        <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Approval
          </p>
          <Textarea
            rows={3}
            placeholder="Optional comment (e.g. 'Tighten the subhead.')"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button
              onClick={() => submit("approve")}
              loading={pending === "approve"}
              disabled={pending !== null}
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              onClick={() => submit("changes")}
              loading={pending === "changes"}
              disabled={pending !== null}
            >
              Request changes
            </Button>
          </div>
        </section>
      )}

      {artifact.approved_at && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Approved · {new Date(artifact.approved_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}
