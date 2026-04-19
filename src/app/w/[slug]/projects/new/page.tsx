"use client";

import { FormEvent, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, CompetitorOut, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const [name, setName] = useState("");
  const [launchDate, setLaunchDate] = useState("");
  const [competitorId, setCompetitorId] = useState<string>("");
  const [brief, setBrief] = useState("");
  const [urls, setUrls] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorOut[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.listCompetitors(slug);
        setCompetitors(list);
      } catch {
        /* non-fatal */
      }
    })();
  }, [slug]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData();
    form.set("name", name);
    if (launchDate) form.set("launch_date", launchDate);
    if (competitorId) form.set("target_competitor_id", competitorId);
    if (brief.trim()) form.set("brief_text", brief);
    if (urls.trim()) form.set("urls", urls);
    if (files) {
      Array.from(files).forEach((file) => form.append("files", file));
    }
    try {
      const proj = await api.createProject(slug, form);
      router.replace(`/w/${slug}/projects/${proj.id}`);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to create project.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          New Marketing Project
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Brief VibeCast on your launch.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
          Everything you&apos;d give a new marketing hire on day one. The more
          context, the better the campaign.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <Field label="Project name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Spring Launch — Workspace Copilot"
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Launch date (optional)">
            <Input
              type="date"
              value={launchDate}
              onChange={(e) => setLaunchDate(e.target.value)}
            />
          </Field>

          <Field label="Target competitor (optional)" hint="Battle card + positioning focus.">
            <select
              value={competitorId}
              onChange={(e) => setCompetitorId(e.target.value)}
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">— None —</option>
              {competitors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Launch brief (optional)"
          hint="Paste your internal launch doc or a few paragraphs about what you're shipping."
        >
          <Textarea
            rows={8}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder={`We are shipping Workspace Copilot...\nKey features:\n- ...\n- ...`}
          />
        </Field>

        <Field label="Reference URLs (optional)" hint="One per line. Internal docs, blog drafts, user research.">
          <Textarea
            rows={4}
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            className="font-mono text-xs"
            placeholder={"https://notion.so/...\nhttps://linear.app/...\nhttps://yourblog.com/draft"}
          />
        </Field>

        <Field label="Source files (optional)" hint="PDFs, screenshots, text docs. Up to 20 MB each.">
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            accept=".pdf,.txt,.md,.html,image/*"
            className="block w-full text-sm text-zinc-500 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700 dark:file:bg-zinc-100 dark:file:text-zinc-900"
          />
          {files && (
            <p className="mt-2 text-xs text-zinc-500">
              Attached: {Array.from(files).map((f) => f.name).join(", ")}
            </p>
          )}
        </Field>

        <p className="text-xs text-zinc-500">
          Provide at least one of: brief text, URLs, or files.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <Button type="submit" size="lg" loading={submitting}>
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
}
