import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-rose-500 text-[11px] font-bold text-white">
              V
            </span>
            <span className="text-sm font-semibold tracking-tight">VibeCast</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/w/pullman"
              className="hidden rounded-md px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 sm:block dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Open demo
            </Link>
            <Link
              href="/w/pullman/projects/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Start a project
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.18),transparent_70%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-20 pt-20 sm:pt-28">
          <div className="flex items-center gap-2 self-start rounded-full border border-indigo-200/70 bg-indigo-50/70 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Built for the OpenCode Buildathon · Claude Agent SDK
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            The AI marketing team
            <br />
            for your next launch.
          </h1>
          <p className="max-w-2xl text-lg leading-7 text-zinc-600 dark:text-zinc-300">
            Hand VibeCast a brief, a spec, or a pile of docs. A supervised multi-agent
            pipeline — CMO, research, strategy, brand guardian, and specialist studios —
            returns a <span className="font-medium text-zinc-900 dark:text-zinc-100">full on-brand campaign</span> in
            under four minutes: blog, press, social, lifecycle emails, HN, Product Hunt,
            a battle card, and a podcast episode.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/w/pullman/projects/cd951986-e735-46b1-9e42-a8b4386634f3"
              className="group inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              See the Pullman demo
              <span
                className="translate-x-0 transition group-hover:translate-x-0.5"
                aria-hidden
              >
                →
              </span>
            </Link>
            <Link
              href="/w/pullman/projects/new"
              className="inline-flex h-11 items-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-600"
            >
              Start from scratch
            </Link>
            <span className="text-xs text-zinc-500">
              No sign-in. Jump in — demo data already loaded.
            </span>
          </div>

          {/* Quick stats strip */}
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-zinc-200/70 pt-8 sm:grid-cols-4 dark:border-zinc-800">
            {[
              ["12", "artifacts / launch"],
              ["17", "specialist agents"],
              ["~4 min", "brief → campaign"],
              ["100%", "brand-checked"],
            ].map(([stat, label]) => (
              <div key={label} className="flex flex-col">
                <span className="text-2xl font-semibold tracking-tight">{stat}</span>
                <span className="text-xs text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — narrative in three beats */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps. Zero silent magic.
            </h2>
          </div>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              n: "01",
              title: "Upload the brief",
              body: "PDFs, Markdown, a one-pager, a few competitor URLs. VibeCast ingests the raw signal.",
            },
            {
              n: "02",
              title: "CMO runs the pipeline",
              body: "Intake → live web research → strategy synthesis, streamed token-by-token into your trace so you watch the plan form.",
            },
            {
              n: "03",
              title: "Review, approve, ship",
              body: "12 artifacts drafted by specialist studios, each brand-checked. Approve the ones you like, route the rest back with a comment.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900 dark:hover:border-zinc-700"
            >
              <span className="font-mono text-xs text-zinc-400">{s.n}</span>
              <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Studios grid */}
      <section className="border-t border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Four studios, one approval queue
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Specialist agents for each surface your team already ships.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                dot: "bg-violet-500",
                title: "Content Studio",
                body: "Launch blog (GEO-optimized), press release, release notes.",
              },
              {
                dot: "bg-sky-500",
                title: "Social Studio",
                body: "X thread, LinkedIn company + founder posts, HN, Product Hunt kit.",
              },
              {
                dot: "bg-amber-500",
                title: "Lifecycle Studio",
                body: "Customer announcement email, prospect nurture, sales battle card.",
              },
              {
                dot: "bg-rose-500",
                title: "Podcast Studio",
                body: "Launch episode transcript, AI-hosted, cover art, RSS metadata.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${s.dot}`}
                  aria-hidden
                />
                <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col items-start gap-6 rounded-2xl border border-zinc-200 bg-gradient-to-br from-indigo-50 via-white to-rose-50 p-10 dark:border-zinc-800 dark:from-indigo-950/40 dark:via-zinc-950 dark:to-rose-950/30">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">
            Try it now
          </p>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            The Pullman v3 demo is pre-loaded. Open the workspace and hit{" "}
            <span className="rounded-md bg-zinc-900 px-2 py-1 font-mono text-xl text-white dark:bg-zinc-50 dark:text-zinc-900">
              Run planning
            </span>
            .
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/w/pullman"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Open Pullman workspace
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/w/pullman/brand"
              className="text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Inspect the brand kit →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-zinc-500">
          <span>VibeCast · OpenCode Buildathon 2026</span>
          <span>Powered by Claude Sonnet 4.5 + the Claude Agent SDK</span>
        </div>
      </footer>
    </main>
  );
}
