import { FREE_INCLUDES } from "./free-includes";

export default function ProFreeReassurance({ socialReady }: { socialReady: boolean }) {
  const items = socialReady ? FREE_INCLUDES : FREE_INCLUDES.filter((item) => !item.startsWith("Social"));
  return (
    <section aria-labelledby="pro-free-heading" className="dash-card p-5">
      <h2 id="pro-free-heading" className="font-semibold">
        Your Free Plan Is Still Here
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Keep using Vendl Free for your shop, products, stock, orders and included marketing tools. Upgrade when you
        want Pro&apos;s additional capabilities. Card payments on Free carry the 2.5% Vendl fee.
      </p>
      <details className="group mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[var(--leaf-dark)] focus-visible:outline-2 focus-visible:outline-[var(--leaf)]">
          <span aria-hidden className="transition-transform group-open:rotate-90">
            ›
          </span>
          See everything included on Free
        </summary>
        <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-sm text-[var(--muted)] sm:grid-cols-2">
          {items.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
