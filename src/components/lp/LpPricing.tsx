import Link from "next/link";

export default function LpPricing() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-12">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
        Free plan. A$0 per month. Every feature.
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
        Cash and PayID are always free; card payments carry a small fee per
        sale.
      </p>
      <p className="mt-4">
        <Link
          href="/#pricing"
          className="text-sm font-semibold text-[var(--leaf-dark)] underline underline-offset-2"
        >
          See full pricing
        </Link>
      </p>
    </section>
  );
}
