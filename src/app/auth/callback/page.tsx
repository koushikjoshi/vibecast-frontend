"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ApiError, api } from "@/lib/api";

function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) {
        setError("Missing token.");
        return;
      }
      try {
        await api.consumeMagicLink(token);
        const me = await api.me();
        if (cancelled) return;
        if (me.memberships.length === 0) {
          router.replace("/onboarding");
        } else {
          router.replace(`/w/${me.memberships[0].workspace_slug}`);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Unable to sign you in. The link may have expired.");
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {error ? (
          <>
            <h1 className="text-lg font-semibold">Sign-in failed</h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <a
              href="/auth/login"
              className="mt-6 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
            >
              Request a new magic link →
            </a>
          </>
        ) : (
          <>
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
              Signing you in…
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
        </main>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
