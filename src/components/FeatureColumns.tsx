import {
  CARD_PLAN_FEATURES,
  CARD_PLAN_HARDWARE_BLURB,
  CARD_PLAN_RESTOCK_BLURB,
} from "@/lib/plan-copy";

const OWNER_LIVE = [
  "Unlimited products, real stock counts",
  "Printable QR poster - print, download, copy",
  "Cash and PayID (Australia only) payments, customer-confirmed",
  "Tap & Go - card, Apple Pay, Google Pay",
  CARD_PLAN_HARDWARE_BLURB,
  "Paid straight to your Stripe account: no cash box to empty, count, or bank",
  "Sale alerts - email and push",
  "Low-stock alerts before you run out",
  "Restock from your phone, in the field",
  CARD_PLAN_RESTOCK_BLURB,
  "Orders dashboard - what sold, when, for how much",
  "Stock shows Available / Low / Sold out",
  "Add to your phone Home Screen for push alerts - no App Store install",
  ...CARD_PLAN_FEATURES,
] as const;

const OWNER_SOON = ["PayPal at the gate"] as const;

const CUSTOMER_LIVE = [
  "Scan with your phone camera. No app.",
  "See what's there and what's left.",
  "Pay cash and PayID (Australia only), then confirm - the owner knows.",
  "Tap & Go - card, Apple Pay, Google Pay on your phone",
  "Pre-order and pay by card to reserve for a collection day",
  "See when orders close, when to collect, and how many slots are left",
  "Get a confirmation email with your order details",
  "Opt in for an email when the stand restocks",
] as const;

const CUSTOMER_SOON = ["PayPal checkout"] as const;

function FeatureColumn({
  title,
  live,
  soon,
}: {
  title: string;
  live: readonly string[];
  soon: readonly string[];
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-[var(--pad-lg)]">
      <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        {title}
      </h3>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--leaf)]">
        Live today
      </p>
      <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
        {live.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="shrink-0 text-[var(--leaf)]" aria-hidden>
              ✓
            </span>
            <span
              className={
                item.includes("no percentage") || item.includes("No percentage")
                  ? "font-semibold text-[var(--marigold)]"
                  : undefined
              }
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
      {soon.length > 0 ? (
        <>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Coming soon
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            {soon.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0" aria-hidden>
                  ○
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

export default function FeatureColumns() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        <FeatureColumn title="For stall owners" live={OWNER_LIVE} soon={OWNER_SOON} />
        <FeatureColumn title="For customers" live={CUSTOMER_LIVE} soon={CUSTOMER_SOON} />
      </div>
    </section>
  );
}
