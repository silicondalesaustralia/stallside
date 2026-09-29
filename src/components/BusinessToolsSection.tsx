import { MARKETING_FEATURE_GROUPS } from "@/lib/marketing-feature-groups";

export default function BusinessToolsSection({
  heading = "Run your whole business",
  support = "More than a checkout. Stock, your shop, customers and suppliers - all included on Free and Pro.",
}: {
  heading?: string;
  support?: string;
}) {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="relative mb-6">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <h2 className="pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          {heading}
        </h2>
        <p className="mt-3 max-w-2xl pl-3 text-base text-[var(--muted)] sm:text-lg">
          {support}
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MARKETING_FEATURE_GROUPS.map((group) => (
          <li
            key={group.title}
            className="flex flex-col rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-sm"
          >
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--field)]">
              {group.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{group.blurb}</p>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--field)]/85">
              {group.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-[var(--leaf)]">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
