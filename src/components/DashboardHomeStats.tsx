import DashboardStat from "@/components/DashboardStat";
import { formatMoney } from "@/lib/money";

type Summary = {
  salesCents: number;
  cashCents: number;
  digitalCents: number;
  orderCount: number;
  currency: string;
};

export default function DashboardHomeStats({
  current,
  previous,
}: {
  current: Summary;
  previous: Summary;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStat
        label="Sales"
        value={formatMoney(current.salesCents, current.currency)}
        current={current.salesCents}
        previous={previous.salesCents}
      />
      <DashboardStat
        label="Cash / PayID"
        value={formatMoney(current.cashCents, current.currency)}
        current={current.cashCents}
        previous={previous.cashCents}
      />
      <DashboardStat
        label="Card / PayPal"
        value={formatMoney(current.digitalCents, current.currency)}
        current={current.digitalCents}
        previous={previous.digitalCents}
      />
      <DashboardStat
        label="Orders"
        value={String(current.orderCount)}
        current={current.orderCount}
        previous={previous.orderCount}
      />
    </section>
  );
}
