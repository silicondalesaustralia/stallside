import type { ExtractedInvoice } from "./extract";
import { matchMaterial, type MatchCandidate } from "./match";
import type { ReviewInvoice, ReviewLine, ScannedLine } from "./schema";

const toCents = (value: number | null) => (value == null ? null : Math.round(value * 100));

/** Cost to record: ex-tax for tax-registered owners (they claim it back), otherwise what was paid. */
function lineCostCents(line: ScannedLine, pricesIncludeTax: boolean, exTax: boolean): number {
  const total = line.lineTotal;
  const tax = line.lineTax ?? 0;
  const cost = exTax ? (pricesIncludeTax ? total - tax : total) : pricesIncludeTax ? total : total + tax;
  return Math.max(0, Math.round(cost * 100));
}

function reviewLine(
  line: ScannedLine,
  index: number,
  invoice: ExtractedInvoice,
  materials: MatchCandidate[],
  exTax: boolean,
): ReviewLine {
  const sized = line.packSize != null && line.packUnit != null;
  const materialId = line.isMaterial ? matchMaterial(line.description, invoice.supplier, materials) : null;
  return {
    key: `line-${index}`,
    description: line.description,
    include: line.isMaterial && line.lineTotal > 0,
    materialId: materialId ?? (line.isMaterial ? "new" : ""),
    quantity: sized ? line.packCount * (line.packSize ?? 1) : line.packCount,
    unit: sized && line.packUnit ? line.packUnit : "EACH",
    totalCents: lineCostCents(line, invoice.pricesIncludeTax ?? true, exTax),
    confidence: line.confidence,
  };
}

export function buildReview(
  invoice: ExtractedInvoice,
  ctx: { materials: MatchCandidate[]; gstRegistered: boolean; today: string; receiptUrl: string | null; duplicateOf: string | null },
): ReviewInvoice {
  return {
    supplier: invoice.supplier ?? "",
    invoiceNumber: invoice.invoiceNumber ?? "",
    invoiceDate: invoice.invoiceDate ?? ctx.today,
    currency: invoice.currency,
    totalCents: toCents(invoice.total),
    taxCents: toCents(invoice.tax),
    receiptUrl: ctx.receiptUrl,
    duplicateOf: ctx.duplicateOf,
    costBasis: ctx.gstRegistered ? "ex-tax" : "inc-tax",
    lines: invoice.lines.map((line, i) => reviewLine(line, i, invoice, ctx.materials, ctx.gstRegistered)),
  };
}
