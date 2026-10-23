import { formatMoney } from "@/lib/money";

type Payout = {
  id: string;
  amountCents: number;
  currency: string;
  note: string | null;
  paidAt: Date;
  affiliateOwner: { businessName: string };
};

const dateFormat = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function AdminAffiliatePayouts({ payouts }: { payouts: Payout[] }) {
  return (
    <section className="dash-card p-5">
      <h2 className="text-lg font-semibold">Recent payouts</h2>
      {payouts.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">No payouts recorded yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-[var(--line)] text-sm">
          {payouts.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2">
              <span>
                <span className="font-semibold">{p.affiliateOwner.businessName}</span>
                <span className="text-[var(--muted)]">
                  {" "}
                  · {dateFormat.format(p.paidAt)}
                  {p.note ? ` · ${p.note}` : ""}
                </span>
              </span>
              <span className="font-semibold">{formatMoney(p.amountCents, p.currency)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
