const OWNER_LIVE = [
  "Unlimited products, real stock counts",
  "Printable QR poster — print, download, copy",
  "Cash payments, customer-confirmed",
  'Sale alerts: email + push ("Someone just paid $12 at your gate")',
  "Low-stock alerts before you run out",
  "Restock from your phone, in the field",
  "Orders dashboard — what sold, when, for how much",
  "Stock shows as Available / Low / Sold out (exact counts optional)",
  "Owner app on iPhone & Android",
] as const;

const OWNER_SOON = [
  "Tap & Go — card, Apple Pay, Google Pay at your gate",
  "No terminal, no hardware, no percentage of your sales",
] as const;

const CUSTOMER_LIVE = [
  "Scan the QR with your phone camera. No app.",
  "See what's there and what's left.",
  "Pay cash and confirm — the owner knows it's paid.",
] as const;

const CUSTOMER_SOON = [
  "Tap & Go — card, Apple Pay, Google Pay. No cash, no problem.",
  "Save your card once, pay in one tap.",
] as const;

function FeatureBlock({
  title,
  live,
  soon,
}: {
  title: string;
  live: readonly string[];
  soon: readonly string[];
}) {
  return (
    <div>
      <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        {title}
      </h3>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--leaf-dark)]">
        Live today
      </p>
      <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
        {live.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--warn)]">
        Coming soon
      </p>
      <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
        {soon.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function FeatureLists() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-14 px-6 py-16 lg:grid-cols-2">
      <FeatureBlock title="For stall owners" live={OWNER_LIVE} soon={OWNER_SOON} />
      <FeatureBlock title="For customers" live={CUSTOMER_LIVE} soon={CUSTOMER_SOON} />
    </section>
  );
}
