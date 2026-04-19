"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ApiError, WorkspaceOut, api } from "@/lib/api";

type Params = { slug: string };

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params> | Params;
}) {
  const pathname = usePathname();
  const [slug, setSlug] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const resolved = await Promise.resolve(params);
      if (cancelled) return;
      setSlug(resolved.slug);
      try {
        const wsRes = await api.getWorkspace(resolved.slug);
        if (cancelled) return;
        setWorkspace(wsRes);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Unable to load workspace.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-red-500">
            Workspace error
          </p>
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">{error}</p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Back home
          </Link>
        </div>
      </main>
    );
  }

  if (!workspace || !slug) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
      </main>
    );
  }

  const nav = [
    { href: `/w/${slug}`, label: "Overview" },
    { href: `/w/${slug}/projects`, label: "Projects" },
    { href: `/w/${slug}/brand`, label: "Brand Kit" },
    { href: `/w/${slug}/competitors`, label: "Competitors" },
    { href: `/w/${slug}/approval`, label: "Approvals" },
  ];

  const isActive = (href: string) => {
    if (href === `/w/${slug}`) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-zinc-50/40 dark:bg-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/85 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold tracking-tight"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-rose-500 text-[11px] font-bold text-white">
                V
              </span>
              VibeCast
            </Link>
            <span className="text-xs text-zinc-400">/</span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium dark:bg-zinc-900">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {workspace.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="hidden font-mono sm:inline">/{workspace.slug}</span>
            <Link
              href={`/w/${slug}/projects/new`}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              New project
            </Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-md px-3 py-1.5 font-medium transition-colors ${
                  active
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-[9px] h-0.5 rounded-full bg-zinc-900 dark:bg-zinc-50" />
                )}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
