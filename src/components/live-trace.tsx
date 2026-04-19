"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  "brand-guardian": "bg-fuchsia-500",
};

function agentColor(agent?: string | null): string {
  if (!agent) return "bg-zinc-400";
  if (AGENT_COLORS[agent]) return AGENT_COLORS[agent];
  if (agent.startsWith("content:")) return "bg-violet-500";
  if (agent.startsWith("social:")) return "bg-sky-500";
  if (agent.startsWith("lifecycle:")) return "bg-amber-500";
  if (agent.startsWith("podcast:")) return "bg-rose-500";
  return "bg-zinc-400";
}

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
  // Keyed by agent label — current in-flight streaming text.
  const [streams, setStreams] = useState<Record<string, string>>({});
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [status, setStatus] = useState<"running" | "succeeded" | "failed">(
    "running",
  );
  const endRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    const url = api.runEventsUrl(slug, runId);
    const src = new EventSource(url);

    const onMessage = (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data) as TraceEvent;
        if (parsed.type === "heartbeat") return;

        if (parsed.type === "chunk") {
          const key = parsed.agent ?? "stream";
          setActiveAgent(key);
          setStreams((prev) => ({
            ...prev,
            [key]: (prev[key] ?? "") + (parsed.message ?? ""),
          }));
          return;
        }

        setEvents((prev) => [...prev, parsed]);

        if (parsed.type === "step.started" && parsed.agent) {
          setActiveAgent(parsed.agent);
        }
        if (parsed.type === "run.succeeded") {
          setStatus("succeeded");
          setActiveAgent(null);
          onComplete?.("succeeded", parsed.data ?? undefined);
          src.close();
        } else if (parsed.type === "run.failed") {
          setStatus("failed");
          setActiveAgent(null);
          onComplete?.("failed", parsed.data ?? undefined);
          src.close();
        }
      } catch {
        /* ignore malformed */
      }
    };

    for (const name of [
      "run.started",
      "step.started",
      "step.succeeded",
      "step.failed",
      "log",
      "artifact",
      "chunk",
      "run.succeeded",
      "run.failed",
      "message",
    ]) {
      src.addEventListener(name, onMessage);
    }
    src.onerror = () => {
      /* browser auto-reconnects */
    };

    return () => {
      src.close();
    };
  }, [slug, runId, onComplete]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [events.length]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [activeAgent, streams]);

  const liveText = useMemo(() => {
    if (!activeAgent) return "";
    return streams[activeAgent] ?? "";
  }, [activeAgent, streams]);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-2 text-xs dark:border-zinc-800">
        <span className="font-semibold uppercase tracking-wider text-zinc-500">
          Live agent trace
        </span>
        <div className="flex items-center gap-2">
          {status === "running" && (
            <span className="flex h-2 w-2">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-indigo-500" />
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${
              status === "running"
                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200"
                : status === "succeeded"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200"
                : "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-200"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {activeAgent && liveText && (
        <div className="border-b border-zinc-200 bg-zinc-900 px-4 py-3 text-xs dark:border-zinc-800">
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-400">
            <span
              className={`h-1.5 w-1.5 animate-pulse rounded-full ${agentColor(
                activeAgent,
              )}`}
            />
            <span>streaming · {activeAgent}</span>
          </div>
          <pre
            ref={streamRef}
            className="max-h-[200px] overflow-y-auto whitespace-pre-wrap break-words font-mono text-[11.5px] leading-relaxed text-zinc-100"
          >
            {liveText}
            <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-emerald-400" />
          </pre>
        </div>
      )}

      <ol className="max-h-[360px] overflow-y-auto px-4 py-3 font-mono text-xs">
        {events.length === 0 && (
          <li className="py-1 text-zinc-500">Waiting for the CMO to begin…</li>
        )}
        {events.map((e, i) => (
          <li
            key={`${i}-${e.step_id ?? e.type}`}
            className="flex items-start gap-2 py-0.5"
          >
            <span
              className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${agentColor(
                e.agent,
              )}`}
            />
            <div className="flex-1">
              <span className="text-zinc-900 dark:text-zinc-50">
                {e.agent ? `[${e.agent}] ` : ""}
                {e.tool ? `${e.tool} · ` : ""}
                {e.message ?? e.type}
              </span>
              {e.data?.cost_usd != null && (
                <span className="ml-2 text-zinc-500">
                  ${Number(e.data.cost_usd).toFixed(4)} ·{" "}
                  {String(e.data.tokens_in ?? "?")}/
                  {String(e.data.tokens_out ?? "?")} tokens ·{" "}
                  {String(e.data.duration_ms ?? "?")}ms
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
