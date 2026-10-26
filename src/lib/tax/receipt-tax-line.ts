import { formatMoney } from "@/lib/money";
import { taxConfig, type TaxOwner } from "./config";

/** Receipt wording for an order's tax, e.g. "Includes GST $1.20 · ABN 12 345 678 901". Null when no tax. */
export function receiptTaxLine(
  owner: TaxOwner & { abn: string | null },
  order: { gstCents: number; currency: string },
): string | null {
  const config = taxConfig(owner, order.currency);
  if (!config.applies || order.gstCents <= 0) return null;
  const amount = formatMoney(order.gstCents, order.currency);
  const tax = config.inclusive ? `Includes ${config.name} ${amount}` : `${config.name} ${amount}`;
  return owner.abn ? `${tax} · ${config.idLabel} ${owner.abn}` : tax;
}
