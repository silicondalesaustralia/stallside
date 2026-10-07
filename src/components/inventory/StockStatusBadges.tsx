import type { ProductSupplyStatus } from "@/generated/prisma/client";
import {
  STOCK_STATUS_LABEL,
  supplyStatusLabel,
  type StockStatus,
} from "@/lib/inventory/inventory-status";

const STOCK_TONE: Record<StockStatus, string> = {
  in_stock: "bg-[var(--leaf)]/15 text-[var(--leaf-dark)]",
  low: "bg-amber-100 text-amber-800",
  out: "bg-red-100 text-red-700",
};

const badge =
  "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap";

export default function StockStatusBadges({
  stockStatus,
  supplyStatus,
  incoming = 0,
}: {
  stockStatus?: StockStatus;
  supplyStatus: ProductSupplyStatus | null;
  incoming?: number;
}) {
  const supply = supplyStatusLabel(supplyStatus);
  return (
    <span className="inline-flex flex-wrap gap-1">
      {stockStatus ? (
        <span className={`${badge} ${STOCK_TONE[stockStatus]}`}>
          {STOCK_STATUS_LABEL[stockStatus]}
        </span>
      ) : null}
      {supply ? (
        <span className={`${badge} bg-sky-100 text-sky-800`}>{supply}</span>
      ) : null}
      {incoming > 0 ? (
        <span className={`${badge} bg-violet-100 text-violet-800`}>
          {incoming} incoming
        </span>
      ) : null}
    </span>
  );
}
