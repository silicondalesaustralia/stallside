import { PaymentMethod } from "@/generated/prisma/client";
import DashboardStat from "@/components/DashboardStat";
import SalesSeriesChart from "@/components/SalesSeriesChart";
import { PAYMENT_METHOD_LABELS, getAdminSalesWindow } from "@/lib/admin-sales";
import { audRatesFromMarket } from "@/lib/fx-to-aud";
import { formatMoney } from "@/lib/money";
import { DEFAULT_CURRENCY } from "@/lib/constants";

export default async function AdminSalesSection({
  windowLabel,
  start,
  end,
  prevStart,
  prevEnd,
  compare,
}: {
  windowLabel: string;
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  compare: boolean;
}) {
  const fx = await audRatesFromMarket();
  const [sales, prev] = await Promise.all([
    getAdminSalesWindow(start, end, fx),
    compare ? getAdminSalesWindow(prevStart, prevEnd, fx) : Promise.resolve(null),
  ]);
  const money = (cents: number) => formatMoney(cents, DEFAULT_CURRENCY);

  return (
    <>
      <SalesSeriesChart
        points={sales.points}
        previousPoints={prev?.points}
        currency={DEFAULT_CURRENCY}
        title={`${windowLabel} · Stall sales (all methods)`}
      />
      <p className="-mt-6 text-sm text-[var(--muted)]">
        Every paid or confirmed order: cash, PayID, card, PayPal and Square,
        including Free for Life and Pro stalls with no Vendl fee. Demo stands
        excluded.
      </p>

      <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Object.values(PaymentMethod).map((method) => (
          <DashboardStat
            key={method}
            label={`${PAYMENT_METHOD_LABELS[method]} · ${sales.byMethod[method].count}`}
            value={money(sales.byMethod[method].audCents)}
          />
        ))}
        <DashboardStat
          label={`No Vendl fee · ${sales.noFeeCount}`}
          value={money(sales.noFeeAudCents)}
        />
      </section>
    </>
  );
}
