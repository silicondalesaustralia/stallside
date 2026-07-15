export default function TrustSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-[var(--pad-lg)] sm:p-10">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <h2 className="max-w-2xl pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Built on the honesty you already run on
        </h2>
        <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          <p>
            Roadside stalls have always worked on trust, and they work. Your customers already want
            to pay; sometimes they just don&apos;t have the cash. Stallside is for exactly those
            moments: a tap instead of a rummage for coins. Same honesty box, more ways to drop the
            money in.
          </p>
          <p>
            Every sale is logged the moment it happens, with an instant alert and live stock, so you
            always know what left and what came in.
          </p>
        </div>
      </div>
    </section>
  );
}
