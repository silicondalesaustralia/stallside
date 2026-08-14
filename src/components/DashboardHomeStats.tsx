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
  ordersHref,
}: {
  current: Summary;
  previous: Summary;
  ordersHref: string;
}) {
  return (
    <div className="grid min-h-[154px] flex-[1.15] grid-cols-3 gap-3 sm:gap-4">
      <DashboardStat
        label="Sales"
        href={ordersHref}
        value={formatMoney(current.salesCents, current.currency)}
        current={current.salesCents}
        previous={previous.salesCents}
      />
      <DashboardStat
        label="Orders"
        href={ordersHref}
        value={String(current.orderCount)}
        current={current.orderCount}
        previous={previous.orderCount}
      />
      <DashboardStat
        label="Card / PayPal"
        href={ordersHref}
        value={formatMoney(current.digitalCents, current.currency)}
        current={current.digitalCents}
        previous={previous.digitalCents}
      />
    </div>
  );
}
