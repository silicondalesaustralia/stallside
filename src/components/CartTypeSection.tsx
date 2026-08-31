import Link from "next/link";
import CartTypeDemoPhones from "@/components/CartTypeDemoPhones";

/** Stall take-now carts only — not pre-orders or subscriptions. */
export default function CartTypeSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-[var(--pad-lg)] sm:p-10">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <p className="pl-3 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
          For stands · All plans
        </p>
        <h2 className="mt-2 max-w-2xl pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Cart type: Product or Customer Choice
        </h2>
        <p className="mt-4 max-w-2xl pl-3 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          When you set up your stall QR, pick how shoppers pay. Same payment
          methods either way — cash, card, and local transfer. Customer Choice
          is for unattended shelves where items already have price tags and you
          don’t need a digital catalogue.
        </p>

        <CartTypeDemoPhones />

        <div className="mt-8 flex flex-wrap gap-3 pl-3">
          <Link
            href="/signup"
            className="inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Get Free Account
          </Link>
          <Link
            href="/stall"
            className="inline-flex rounded-[var(--radius-pill)] border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--field)]"
          >
            More about stalls
          </Link>
        </div>
      </div>
    </section>
  );
}
