"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS: { id: string; label: string; description: string }[] = [
  {
    id: "professional",
    label: "Professional",
    description: "Clear, confident, measured. No hype. Evidence before claims.",
  },
  {
    id: "authoritative",
    label: "Authoritative",
    description: "Direct, opinionated, citation-dense. The category expert.",
  },
  {
    id: "technical",
    label: "Technical",
    description: "Precise, jargon-aware, specificity over marketing gloss.",
  },
  {
    id: "playful",
    label: "Playful",
    description: "Warm, witty, human. Short sentences. Wry humor.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [name, setName] = useState("");
  const [preset, setPreset] = useState("professional");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me();
        if (cancelled) return;
        if (me.memberships.length > 0) {
          router.replace(`/w/${me.memberships[0].workspace_slug}`);
          return;
        }
        setAuthChecked(true);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/auth/login");
          return;
        }
        setError("Unable to load your account. Please retry.");
        setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const ws = await api.createWorkspace({ name: name.trim(), brand_preset: preset });
      router.replace(`/w/${ws.slug}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Couldn't create your workspace.");
      }
      setCreating(false);
    }
  };

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
        Step 1 · Workspace
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Let&apos;s set up your marketing org.
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        Name your workspace and pick a brand voice preset. You can refine everything
        from the Brand Kit after this.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <label className="block text-sm">
          <span className="text-zinc-700 dark:text-zinc-200">Workspace name</span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Acme Inc"
            className="mt-1 max-w-md"
            autoFocus
          />
        </label>

        <fieldset>
          <legend className="text-sm text-zinc-700 dark:text-zinc-200">
            Brand voice preset
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {PRESETS.map((p) => (
              <label
                key={p.id}
                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                  preset === p.id
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
                }`}
              >
                <input
                  type="radio"
                  name="preset"
                  value={p.id}
                  checked={preset === p.id}
                  onChange={() => setPreset(p.id)}
                  className="sr-only"
                />
                <p className="text-sm font-semibold">{p.label}</p>
                <p
                  className={`mt-1 text-xs ${
                    preset === p.id
                      ? "text-white/80 dark:text-zinc-900/80"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {p.description}
                </p>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" loading={creating}>
          Create workspace
        </Button>
      </form>
    </main>
  );
}
