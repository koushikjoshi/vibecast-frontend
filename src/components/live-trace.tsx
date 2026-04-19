"use client";

import { useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";

type TraceEvent = {
  type: string;
  agent?: string;
  tool?: string;
  message?: string;
  data?: Record<string, unknown> | null;
  step_id?: string;
  ts?: string;
};

const AGENT_COLORS: Record<string, string> = {
  cmo: "bg-indigo-500",
  "brief-intake": "bg-emerald-500",
  "market-researcher": "bg-sky-500",
  "competitive-intel": "bg-amber-500",
  "launch-strategist": "bg-rose-500",
};

export function LiveTrace({
  slug,
  runId,
  onComplete,
}: {
  slug: string;
  runId: string;
  onComplete?: (status: "succeeded" | "failed", data?: Record<string, unknown>) => void;
}) {
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [status, setStatus] = useState<"running" | "succeeded" | "failed">(
    "running",
  );
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const url = api.runEventsUrl(slug, runId);
    const src = new EventSource(url, { withCredentials: true });

    const push = (evt: TraceEvent) => {
      setEvents((prev) => [...prev, evt]);
    };

    const onMessage = (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data) as TraceEvent;
        if (parsed.type === "heartbeat") return;
        push(parsed);
        if (parsed.type === "run.succeeded") {
          setStatus("succeeded");
          onComplete?.("succeeded", parsed.data ?? undefined);
          src.close();
        } else if (parsed.type === "run.failed") {
          setStatus("failed");
          onComplete?.("failed", parsed.data ?? undefined);
          src.close();
        }
      } catch {
        /* ignore malformed */
      }
    };

    src.addEventListener("run.started", onMessage);
    src.addEventListener("step.started", onMessage);
    src.addEventListener("step.succeeded", onMessage);
    src.addEventListener("step.failed", onMessage);
    src.addEventListener("log", onMessage);
    src.addEventListener("run.succeeded", onMessage);
    src.addEventListener("run.failed", onMessage);
    src.addEventListener("message", onMessage);
    src.onerror = () => {
      /* browser will reconnect automatically; just leave UI as is. */
    };

    return () => {
      src.close();
    };
  }, [slug, runId, onComplete]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [events.length]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-2 text-xs dark:border-zinc-800">
        <span className="font-semibold uppercase tracking-wider text-zinc-500">
          Live trace
        </span>
        <span
          className={`rounded-full px-2 py-0.5 font-medium ${
            status === "running"
              ? "bg-indigo-100 text-indigo-800"
              : status === "succeeded"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      </div>
      <ol className="max-h-[420px] overflow-y-auto px-4 py-3 font-mono text-xs">
        {events.length === 0 && (
          <li className="py-1 text-zinc-500">Waiting for the CMO to begin…</li>
        )}
        {events.map((e, i) => (
          <li
            key={`${i}-${e.step_id ?? e.type}`}
            className="flex items-start gap-2 py-0.5"
          >
            <span
              className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                e.agent && AGENT_COLORS[e.agent]
                  ? AGENT_COLORS[e.agent]
                  : "bg-zinc-400"
              }`}
            />
            <div className="flex-1">
              <span className="text-zinc-900 dark:text-zinc-50">
                {e.agent ? `[${e.agent}] ` : ""}
                {e.tool ? `${e.tool} · ` : ""}
                {e.message ?? e.type}
              </span>
              {e.data?.cost_usd != null && (
                <span className="ml-2 text-zinc-500">
                  ${Number(e.data.cost_usd).toFixed(4)} · {String(e.data.tokens_in ?? "?")}/{String(e.data.tokens_out ?? "?")} tokens · {String(e.data.duration_ms ?? "?")}ms
                </span>
              )}
            </div>
          </li>
        ))}
        <div ref={endRef} />
      </ol>
    </div>
  );
}
