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
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-red-600">{error}</p>
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

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              VibeCast
            </Link>
            <span className="text-xs text-zinc-400">/</span>
            <span className="text-sm font-medium">{workspace.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-xs text-zinc-500 sm:inline">
              {workspace.slug}
            </span>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
