import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16">
      <nav className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          VibeCast
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/auth/login"
            className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <section className="mt-24 flex flex-col gap-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Marketing team, as a service
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
          An AI marketing team for your next launch.
        </h1>
        <p className="max-w-2xl text-lg leading-7 text-zinc-600 dark:text-zinc-300">
          Upload your launch doc, screenshots, and a competitor URL. In under 10 minutes,
          VibeCast produces a full, on-brand campaign across content, social, lifecycle,
          and podcast — with real web research and citations. Everything routes through
          your approval queue before shipping.
        </p>
        <div className="flex gap-3">
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            Start a marketing project
          </Link>
          <a
            href="#how"
            className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-200 px-6 text-sm font-medium hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            See how it works
          </a>
        </div>
      </section>

      <section id="how" className="mt-24 grid gap-6 sm:grid-cols-2">
        {[
          {
            title: "Content Studio",
            body: "Launch blog (GEO-optimized), press release, release notes.",
          },
          {
            title: "Social Studio",
            body: "X thread, LinkedIn company + founder posts, HN Show HN, Product Hunt kit.",
          },
          {
            title: "Lifecycle Studio",
            body: "Customer announcement, prospect nurture, sales battle card.",
          },
          {
            title: "Podcast Studio",
            body: "5-minute launch episode with AI hosts, cover art, transcript, RSS.",
          },
        ].map((s) => (
          <div
            key={s.title}
            className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-semibold">{s.title}</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{s.body}</p>
          </div>
        ))}
      </section>

      <footer className="mt-24 flex items-center justify-between border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800">
        <span>VibeCast · OpenCode Buildathon</span>
        <span>Powered by the Claude Agent SDK</span>
      </footer>
    </main>
  );
}
