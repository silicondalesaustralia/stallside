import { formatMoney } from "@/lib/money";

type Totals = {
  affiliates: number;
  clicks: number;
  signups: number;
  livePro: number;
  monthlyAud: number;
  owedAud: number;
  paidAud: number;
  missedAud: number;
};

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function AdminAffiliateSummary({ totals }: { totals: Totals }) {
  const aud = (cents: number) => formatMoney(cents, "AUD");
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card label="Affiliates with links" value={String(totals.affiliates)} />
      <Card label="Link clicks" value={String(totals.clicks)} />
      <Card label="Referred signups" value={String(totals.signups)} />
      <Card label="Referred live Pro" value={String(totals.livePro)} />
      <Card label="Commission / month" value={aud(totals.monthlyAud)} />
      <Card label="Owed (pending)" value={aud(totals.owedAud)} />
      <Card label="Paid all time" value={aud(totals.paidAud)} />
      <Card label="Lost (affiliate not Pro)" value={aud(totals.missedAud)} />
    </section>
  );
}
