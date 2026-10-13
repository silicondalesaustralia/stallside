import { formatMoney } from "@/lib/money";
import DashboardStat from "@/components/DashboardStat";

type FeeTotals = { stripe: number; square: number; total: number };

export default function AdminFeeStats({
  windowLabel,
  currency,
  window,
  previous,
  allTime,
}: {
  windowLabel: string;
  currency: string;
  window: FeeTotals;
  previous: FeeTotals | null;
  allTime: FeeTotals;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <DashboardStat
        label={`Stripe fees · ${windowLabel}`}
        value={formatMoney(window.stripe, currency)}
        current={previous ? window.stripe : undefined}
        previous={previous?.stripe}
      />
      <DashboardStat
        label={`Square fees · ${windowLabel}`}
        value={formatMoney(window.square, currency)}
        current={previous ? window.square : undefined}
        previous={previous?.square}
      />
      <DashboardStat
        label={`Fees total · ${windowLabel}`}
        value={formatMoney(window.total, currency)}
        current={previous ? window.total : undefined}
        previous={previous?.total}
      />
      <DashboardStat
        label="Stripe fees all-time (AUD)"
        value={formatMoney(allTime.stripe, currency)}
      />
      <DashboardStat
        label="Square fees all-time (AUD)"
        value={formatMoney(allTime.square, currency)}
      />
      <DashboardStat
        label="Fees total all-time (AUD)"
        value={formatMoney(allTime.total, currency)}
      />
    </section>
  );
}
