"use client";

import { useState } from "react";
import Link from "next/link";

import { ApiError, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSending(true);
    try {
      await api.requestMagicLink(email);
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong sending your magic link.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500"
        >
          VibeCast
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          We&apos;ll email you a magic link. No passwords.
        </p>

        {sent ? (
          <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Check <span className="font-medium">{email}</span> for a sign-in link.
            <p className="mt-2 text-xs text-emerald-800/80">
              Demo note: if email isn&apos;t configured in this environment, the link
              will appear in the backend server logs.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="text-zinc-700 dark:text-zinc-200">Work email</span>
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="mt-1"
              />
            </label>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" loading={sending} className="w-full">
              Send magic link
            </Button>
          </form>
        )}

        <p className="mt-6 text-xs text-zinc-500">
          By continuing, you agree not to ship anything you don&apos;t proudly own.
        </p>
      </div>
    </main>
  );
}
