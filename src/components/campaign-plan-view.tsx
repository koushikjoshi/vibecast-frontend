"use client";

import { CampaignPlan } from "@/lib/api";

const IMPACT_BADGE: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-800 border-emerald-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

export function CampaignPlanView({ plan }: { plan: CampaignPlan }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Positioning · v{plan.version}
        </p>
        <p className="mt-2 text-lg font-semibold leading-snug tracking-tight">
          {plan.positioning || "(empty)"}
        </p>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Pillars
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {plan.pillars.map((pillar) => (
            <article
              key={pillar.name}
              className="flex flex-col rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-sm font-semibold">{pillar.name}</h3>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                {pillar.message}
              </p>
              {pillar.proof_points?.length > 0 && (
                <ul className="mt-3 list-disc pl-4 text-xs text-zinc-500">
                  {pillar.proof_points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Audience refinement
          </p>
          <p className="mt-2 rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            {plan.audience_refinement}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Competitor angle
          </p>
          <p className="mt-2 rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            {plan.competitor_angle}
          </p>
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Channel selection
        </p>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {plan.channel_selection.map((c) => (
            <li
              key={c.channel}
              className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <p className="font-semibold">{c.channel}</p>
                <p className="mt-1 text-xs text-zinc-500">{c.rationale}</p>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
                  IMPACT_BADGE[c.expected_impact] ?? IMPACT_BADGE.medium
                }`}
              >
                {c.expected_impact}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Urgency framing
        </p>
        <p className="mt-2 rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {plan.urgency_framing}
        </p>
      </section>
    </div>
  );
}
