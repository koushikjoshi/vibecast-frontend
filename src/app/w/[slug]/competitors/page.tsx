"use client";

import { FormEvent, use, useEffect, useState } from "react";

import { ApiError, CompetitorOut, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function CompetitorsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [items, setItems] = useState<CompetitorOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [pricing, setPricing] = useState("");
  const [changelog, setChangelog] = useState("");
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    try {
      const data = await api.listCompetitors(slug);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load competitors.");
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await reload();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await api.createCompetitor(slug, {
        name,
        website_url: website,
        pricing_url: pricing || null,
        changelog_url: changelog || null,
      });
      setName("");
      setWebsite("");
      setPricing("");
      setChangelog("");
      await reload();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Could not create competitor.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this competitor?")) return;
    try {
      await api.deleteCompetitor(slug, id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Competitors
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Who you&apos;re up against.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
          Competitive Intel agents run live research on each competitor (pricing,
          changelog, positioning) and keep it cached for your battle cards, blog
          posts, and comparisons.
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Add a competitor
        </h2>
        <form
          onSubmit={handleCreate}
          className="mt-4 grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Field label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Acme Rival"
            />
          </Field>
          <Field label="Website URL">
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              required
              placeholder="https://rival.com"
            />
          </Field>
          <Field label="Pricing URL (optional)">
            <Input
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              placeholder="https://rival.com/pricing"
            />
          </Field>
          <Field label="Changelog URL (optional)">
            <Input
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="https://rival.com/changelog"
            />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" loading={creating}>
              Add competitor
            </Button>
          </div>
        </form>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Tracked ({items.length})
        </h2>
        {loading ? (
          <div className="mt-4 h-20 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
        ) : items.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">
            No competitors yet. Add one above.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {items.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-zinc-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <a
                  href={c.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  {c.website_url}
                </a>
                <p className="mt-1 text-xs text-zinc-400">
                  Research: {c.last_fetched_at ? `last run ${new Date(c.last_fetched_at).toLocaleString()}` : "not yet run"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
