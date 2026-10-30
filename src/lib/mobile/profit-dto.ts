import type { ProfitRange, ProfitResponse } from "@/contracts/mobile/profit";
import { resolveDateWindow } from "@/lib/date-range";
import { loadProfit } from "@/lib/production/load-profit";
import { marginPercent } from "@/lib/production/pricing";
import { taxConfig, taxLabel, type TaxOwner } from "@/lib/tax/config";
import { loadStandLocale } from "./stand-locale";

/** Profit and loss for one business over a preset range, as on the web Profit page. */
export async function loadProfitResponse(
  owner: TaxOwner & { id: string },
  stand: { id: string; timezone: string },
  range: ProfitRange,
): Promise<ProfitResponse> {
  const window = resolveDateWindow({ range }, stand.timezone);
  const [p, locale] = await Promise.all([
    loadProfit({ ownerId: owner.id, standId: stand.id, start: window.start, end: window.end }),
    loadStandLocale(stand),
  ]);
  return {
    rangeLabel: window.label,
    currency: locale.currency,
    taxLabel: taxLabel(taxConfig(owner, locale.currency)),
    orders: p.orders,
    salesCents: p.salesCents,
    gstCents: p.gstCents,
    cogsCents: p.cogsCents,
    feesCents: p.feesCents,
    grossProfitCents: p.grossProfitCents,
    grossMarginPercent: marginPercent(p.salesCents - p.gstCents, p.grossProfitCents),
    suppliesPurchasedCents: p.suppliesPurchasedCents,
    batchesMade: p.batchesMade,
    productionCostCents: p.productionCostCents,
    products: p.products,
  };
}
