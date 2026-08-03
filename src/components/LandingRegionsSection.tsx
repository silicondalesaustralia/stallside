import Link from "next/link";

/** Homepage regions block - cash everywhere; digital methods by country. */
export default function LandingRegionsSection() {
  return (
    <section
      id="regions"
      className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12"
    >
      <div className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-[var(--pad-lg)] sm:p-10">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <h2 className="max-w-2xl pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Where can I use Stallside?
        </h2>
        <div className="mt-6 max-w-3xl space-y-4 pl-3 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          <p>
            Everywhere you run a stall. Cash works in any region. Cards, Tap
            &amp; Go, and wallets follow what Stripe supports locally, and some
            methods are country-specific - PayID and PayTo in Australia, Cash
            App in the US, and more as we expand.
          </p>
          <p>
            Missing a payment option you need?{" "}
            <Link
              href="/contact?subject=feature-request"
              className="font-semibold text-[var(--leaf-dark)] underline underline-offset-2 hover:text-[var(--leaf)]"
            >
              Tell us
            </Link>
            , and we&apos;ll add it when it&apos;s available for your country.
          </p>
        </div>
      </div>
    </section>
  );
}
