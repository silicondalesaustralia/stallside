const SOCIAL = ["Facebook", "Instagram", "TikTok", "YouTube", "Pinterest", "X.com"];
const CALENDARS = ["Google Calendar", "Outlook & Microsoft 365"];

const STEPS: { title: string; body: string; chips?: string[] }[] = [
  {
    title: "Link your social accounts",
    body: "Connect once and Vendl can publish the posts you approve. Nothing goes out without you.",
    chips: SOCIAL,
  },
  {
    title: "Sync your calendar",
    body: "Collection days and market dates show up in your own calendar, and changes flow back to Vendl.",
    chips: CALENDARS,
  },
  {
    title: "Manage it all in one place",
    body: "See what's connected, reconnect if a login expires, or disconnect any time.",
  },
  {
    title: "Your team stays safe",
    body: "Only the owner or an admin can connect or disconnect accounts.",
  },
];

export default function ConnectorsComingSoon() {
  return (
    <section className="dash-card flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <span className="inline-flex rounded-full bg-[var(--wash)] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Coming soon
        </span>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Connect Vendl to the tools you already use
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Connectors link your socials and calendar to Vendl so posts and dates stay in step. Here&apos;s what&apos;s coming.
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
        There&apos;s nothing to set up yet. This page will open once Connectors are ready.
      </p>
    </section>
  );
}
