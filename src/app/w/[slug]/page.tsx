import Link from "next/link";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const next = [
    {
      title: "Define your Brand Kit",
      body: "Tell VibeCast your voice, banned phrases, and competitor policy. Everything every agent writes respects this.",
      href: `/w/${slug}/brand`,
      cta: "Open Brand Kit",
    },
    {
      title: "Add your competitors",
      body: "We&apos;ll run live research on each one so your battle cards, blog posts, and positioning are grounded in real evidence.",
      href: `/w/${slug}/competitors`,
      cta: "Add competitors",
    },
    {
      title: "Create your first Marketing Project",
      body: "Upload a launch doc, spec, or a handful of URLs. VibeCast spins up a CMO + 17 specialist agents and returns a full campaign.",
      href: `/w/${slug}/projects`,
      cta: "Start a Project",
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Overview
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Welcome to your workspace.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
          VibeCast is a multi-agent marketing team for your next launch. Follow the
          three steps below to get ready for your first run.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {next.map((card, idx) => (
          <article
            key={card.title}
            className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Step {idx + 1}
            </span>
            <h2 className="mt-2 text-base font-semibold">{card.title}</h2>
            <p
              className="mt-2 flex-1 text-sm text-zinc-600 dark:text-zinc-300"
              dangerouslySetInnerHTML={{ __html: card.body }}
            />
            <Link
              href={card.href}
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {card.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">
        <p className="font-medium">Nothing has run yet.</p>
        <p className="mt-1">
          Once your first Project is underway, this panel will show live agent
          activity, campaign-plan reviews, and artifacts awaiting approval.
        </p>
      </section>
    </div>
  );
}
