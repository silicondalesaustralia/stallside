const PLATFORMS = ["Facebook", "Instagram", "TikTok", "Pinterest", "YouTube", "X.com"];

const STEPS: { title: string; body: string; chips?: string[] }[] = [
  {
    title: "Connect your accounts",
    body: "Link your social accounts once. Vendl only posts what you approve.",
    chips: PLATFORMS,
  },
  {
    title: "Set your brand",
    body: "Your logo, colours and the way you talk, so every post sounds like you.",
  },
  {
    title: "Create posts your way",
    body: "Upload your own photos, videos and captions, or let Vendl draft them for you. Post about anything: products, market days, behind the scenes, news or a special offer.",
  },
  {
    title: "Plan the week",
    body: "Get a suggested posting plan built around what you're selling, then drag posts onto the calendar.",
  },
  {
    title: "Schedule and publish",
    body: "Posts go out at the times you choose, each with a link back to your online store or stall checkout.",
  },
  {
    title: "Keep everything in one place",
    body: "Your images live in a library you can reuse, and you can see every post you've published.",
  },
];

export default function SocialComingSoon() {
  return (
    <section className="dash-card flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <span className="inline-flex rounded-full bg-[var(--wash)] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Coming soon
        </span>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Social posts, made from your shop
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          We&apos;re building a simple way to keep your socials busy without the hours. Here&apos;s how it will work.
        </p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--leaf)] text-sm font-bold text-white">
              {i + 1}
            </span>
            <span>
              <span className="block text-sm font-semibold">{step.title}</span>
              <span className="mt-0.5 block text-sm text-[var(--muted)]">{step.body}</span>
              {step.chips ? (
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {step.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-2.5 py-0.5 text-xs font-medium"
                    >
                      {chip}
                    </span>
                  ))}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-[var(--muted)]">
        There&apos;s nothing to set up yet. This page will open once Social is ready.
      </p>
    </section>
  );
}
