import Link from "next/link";

export default function RestockCustomersSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-[var(--pad-lg)] sm:p-10">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <p className="pl-3 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
          Card plan
        </p>
        <h2 className="mt-2 max-w-2xl pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Tell regulars you&apos;re back in stock
        </h2>
        <div className="mt-6 max-w-3xl space-y-4 pl-3 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          <p>
            Many times your stand will have regular customers — the same faces
            who know when eggs, flowers, or firewood tend to appear. When
            you&apos;re sold out, they leave empty-handed and may not swing by
            again for days.
          </p>
          <p>
            With Stallside on the Card plan, after they pay they can tap once to
            get an email when that stand restocks — nothing else. You restock,
            hit <strong className="font-semibold text-[var(--ink)]">Notify customers</strong>,
            and they hear you&apos;re back. You never see their addresses; Stallside
            sends on your behalf.
          </p>
        </div>
        <div className="mt-8 pl-3">
          <Link
            href="/signup"
            className="inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </section>
  );
}
