import DashboardStat from "@/components/DashboardStat";
import PaymentMethodValue from "@/components/PaymentMethodValue";
import { formatMoney } from "@/lib/money";

type Summary = {
  salesCents: number;
  orderCount: number;
  currency: string;
  hasCash: boolean;
  hasCheckout: boolean;
};

/** Static stats for marketing/demo shots (no live channel filter). */
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
        label="Payment Method"
        href={ordersHref}
        value={
          <PaymentMethodValue
            hasCash={current.hasCash}
            hasCheckout={current.hasCheckout}
          />
        }
      />
    </div>
  );
}
