"use client";

import { use, useEffect, useState } from "react";

import { ApiError, BrandKitOut, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const POLICIES = [
  { id: "blocked", label: "Blocked — never mention competitors by name" },
  { id: "name-only", label: "Name-only — mention competitors, no comparisons" },
  { id: "comparative-ok", label: "Comparative — comparisons allowed with evidence" },
] as const;

type Policy = (typeof POLICIES)[number]["id"];

export default function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [kit, setKit] = useState<BrandKitOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const [positioning, setPositioning] = useState("");
  const [icp, setIcp] = useState("");
  const [voiceDescription, setVoiceDescription] = useState("");
  const [banned, setBanned] = useState("");
  const [disclaimers, setDisclaimers] = useState("");
  const [policy, setPolicy] = useState<Policy>("name-only");
  const [legalFooter, setLegalFooter] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getBrandKit(slug);
        if (cancelled) return;
        setKit(data);
        setPositioning(data.positioning);
        setIcp(data.target_icp);
        const toneVoice = (data.tone as { voice?: string } | null)?.voice ?? "";
        setVoiceDescription(toneVoice);
        setBanned(data.banned_phrases.join("\n"));
        setDisclaimers(data.required_disclaimers.join("\n"));
        setPolicy(data.competitor_policy);
        setLegalFooter(data.legal_footer);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load brand kit.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const lineList = (value: string) =>
    value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFlash(null);
    try {
      const updated = await api.updateBrandKit(slug, {
        positioning,
        target_icp: icp,
        tone: { voice: voiceDescription },
        banned_phrases: lineList(banned),
        required_disclaimers: lineList(disclaimers),
        competitor_policy: policy,
        legal_footer: legalFooter,
      });
      setKit(updated);
      setFlash(`Saved brand kit v${updated.version}.`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to save brand kit.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Brand Kit {kit && <>· v{kit.version}</>}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          The rules every agent follows.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
          Positioning, voice, banned phrases, disclaimers, and competitor policy — all
          enforced by the Brand Guardian before any artifact reaches your approval
          queue. Saving creates a new immutable version.
        </p>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <Field label="One-line positioning" hint="Used verbatim in press and sales deck opens.">
          <Input
            value={positioning}
            onChange={(e) => setPositioning(e.target.value)}
            placeholder="The operating system for B2B marketing teams."
          />
        </Field>

        <Field label="Target ICP" hint="Primary audience. Agents tune tone and examples to this.">
          <Input
            value={icp}
            onChange={(e) => setIcp(e.target.value)}
            placeholder="Seed/Series-A B2B SaaS, ARR $1–20M, PMM or founder-led marketing."
          />
        </Field>

        <Field label="Voice description" hint="Short description of tone + cadence. Brand Guardian rewrites off-voice copy.">
          <Textarea
            rows={3}
            value={voiceDescription}
            onChange={(e) => setVoiceDescription(e.target.value)}
            placeholder="Clear, confident, measured. No hype. Evidence before claims."
          />
        </Field>

        <Field label="Banned phrases" hint="One per line. Blocks any artifact that contains these.">
          <Textarea
            rows={5}
            value={banned}
            onChange={(e) => setBanned(e.target.value)}
            placeholder={"revolutionary\nbest-in-class\ngame-changing"}
            className="font-mono text-xs"
          />
        </Field>

        <Field label="Required disclaimers" hint="Always appended to press, emails, and release notes.">
          <Textarea
            rows={3}
            value={disclaimers}
            onChange={(e) => setDisclaimers(e.target.value)}
            placeholder="Forward-looking statements are predictions and subject to change."
            className="font-mono text-xs"
          />
        </Field>

        <Field label="Competitor policy" hint="How battle cards, blogs, and social handle rivals.">
          <select
            value={policy}
            onChange={(e) => setPolicy(e.target.value as Policy)}
            className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {POLICIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Legal footer" hint="Included in press and long-form artifacts.">
          <Textarea
            rows={2}
            value={legalFooter}
            onChange={(e) => setLegalFooter(e.target.value)}
            placeholder="© 2026 Acme Inc. All rights reserved."
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {flash && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {flash}
          </p>
        )}

        <div>
          <Button type="submit" size="lg" loading={saving}>
            Save new version
          </Button>
        </div>
      </form>
    </div>
  );
}
