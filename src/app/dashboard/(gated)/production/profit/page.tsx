import DateRangeFilter from "@/components/DateRangeFilter";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveDateWindow } from "@/lib/date-range";
import { formatMoney } from "@/lib/money";
import { loadProfit } from "@/lib/production/load-profit";
import { formatPercent, marginPercent } from "@/lib/production/pricing";
import ProductionShell from "../ProductionShell";
import { cardClass } from "../form-styles";
import { loadProductionScope } from "../production-scope";
import ProfitProductTable from "./ProfitProductTable";

function Line({ label, cents, currency, strong, hint }: { label: string; cents: number; currency: string; strong?: boolean; hint?: string }) {
  return (
    <div className={`flex justify-between gap-4 py-2 ${strong ? "text-base font-semibold" : "text-sm"}`}>
      <span>
        {label}
        {hint ? <span className="block text-xs font-normal text-[var(--muted)]">{hint}</span> : null}
      </span>
      <span className={`tabular-nums ${cents < 0 ? "text-red-700" : ""}`}>{formatMoney(cents, currency)}</span>
    </div>
  );
}

export default async function ProfitPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const scope = await loadProductionScope();
  if (!scope.stand) {
    return (
      <ProductionShell active="profit" subtitle="Profit and loss">
        <NoBusinessYet />
      </ProductionShell>
    );
  }
  const { stand } = scope;
  const window = resolveDateWindow({ range: params.range ?? "30d", from: params.from, to: params.to }, stand.timezone);
  const p = await loadProfit({ ownerId: scope.ownerId, standId: stand.id, start: window.start, end: window.end });
  const c = stand.currency;
  const netSales = p.salesCents - p.gstCents;

  return (
    <ProductionShell
      active="profit"
      subtitle={`${window.label} · ${p.orders} paid order(s) · ${stand.name}`}
      actions={
        <DateRangeFilter pathname="/dashboard/production/profit" activeKey={window.key} from={window.fromParam} to={window.toParam} />
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cardClass}>
          <h2 className="mb-1 font-semibold">Profit and loss</h2>
          <div className="flex flex-col divide-y divide-[var(--line)]">
            <Line label="Sales" cents={p.salesCents} currency={c} hint="What customers paid, including delivery and fees passed on" />
            {p.gstCents > 0 ? <Line label="Less GST collected" cents={-p.gstCents} currency={c} /> : null}
            <Line label="Less cost of goods sold" cents={-p.cogsCents} currency={c} hint="Units sold × unit cost" />
            <Line label="Less platform and card fees" cents={-p.feesCents} currency={c} />
            <Line label="Gross profit" cents={p.grossProfitCents} currency={c} strong />
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Gross margin {formatPercent(marginPercent(netSales, p.grossProfitCents))}
          </p>
        </section>
        <section className={cardClass}>
          <h2 className="mb-1 font-semibold">Production in this period</h2>
          <div className="flex flex-col divide-y divide-[var(--line)]">
            <Line label="Supplies purchased" cents={p.suppliesPurchasedCents} currency={c} hint="Cash spent on materials (all businesses)" />
            <Line
              label={`Cost of ${p.batchesMade} batch(es) made`}
              cents={p.productionCostCents}
              currency={c}
              hint="Materials, labour and overhead"
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Supplies are counted in cost of goods when the finished product sells, not when you buy them.
          </p>
        </section>
      </div>
      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">By product</h2>
        <ProfitProductTable rows={p.products} currency={c} />
      </section>
    </ProductionShell>
  );
}
