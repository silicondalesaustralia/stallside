/** In-progress / failed DomainPurchase messaging on Domains. */

const CONNECTING_STATUSES = new Set([
  "PAID",
  "REGISTERING",
  "REGISTERED",
  "CONNECTING",
]);

export type PurchaseStatusRow = {
  hostname: string;
  status: string;
  lastError: string | null;
};

export default function DomainPurchaseBanner({
  purchase,
}: {
  purchase: PurchaseStatusRow;
}) {
  if (purchase.status === "FAILED" || purchase.status === "REFUNDED") {
    return (
      <section className="rounded-xl border border-[var(--gone)]/30 bg-white p-4 text-sm">
        <p className="font-semibold text-[var(--gone)]">
          We couldn&apos;t finish {purchase.hostname}
        </p>
        <p className="mt-1 text-[var(--muted)]">
          {purchase.status === "REFUNDED"
            ? "Your payment was refunded."
            : "Registration failed — if you were charged, a refund is in progress."}
          {purchase.lastError ? ` (${purchase.lastError})` : null}
        </p>
      </section>
    );
  }

  if (!CONNECTING_STATUSES.has(purchase.status)) return null;

  return (
    <section className="rounded-xl border border-[var(--leaf)]/30 bg-white p-4 text-sm">
      <p className="font-semibold text-[var(--field)]">
        We are now connecting {purchase.hostname}
      </p>
      <p className="mt-1 text-[var(--muted)]">
        Come back later to check — this usually takes a few minutes, and can take
        up to about an hour while we register the domain and finish Cloudflare
        setup. You can leave this page; nothing else is required from you for a
        Vendl-bought domain.
      </p>
    </section>
  );
}
