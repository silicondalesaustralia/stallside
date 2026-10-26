import type { ExtractedInvoice } from "./extract";
import { matchMaterial, type MatchCandidate } from "./match";
import type { ReviewInvoice, ReviewLine, ScannedLine } from "./schema";
import type { TaxRegion } from "./tax-region";

const toCents = (value: number | null) => (value == null ? null : Math.round(value * 100));

/**
 * Tax per line. Printed line tax wins; any invoice tax left over (e.g. US receipts that only show a
 * sales-tax total) is shared across taxable material lines in proportion to their totals.
 */
export function lineTaxes(invoice: ExtractedInvoice): number[] {
  const known = invoice.lines.reduce((sum, l) => sum + (l.lineTax ?? 0), 0);
  const remaining = (invoice.tax ?? 0) - known;
  const weights = invoice.lines.map((l) =>
    l.lineTax == null && l.taxable !== false && l.isMaterial && l.lineTotal > 0 ? l.lineTotal : 0,
  );
  const pool = weights.reduce((sum, w) => sum + w, 0);
  return invoice.lines.map((l, i) => l.lineTax ?? (remaining > 0.005 && pool > 0 ? (remaining * weights[i]) / pool : 0));
}

/** When the model can't tell, lines that already add up to the total must include the tax. */
function pricesIncludeTax(invoice: ExtractedInvoice): boolean {
  if (invoice.pricesIncludeTax != null) return invoice.pricesIncludeTax;
  if (invoice.total == null || !invoice.tax) return true;
  const lines = invoice.lines.reduce((sum, l) => sum + l.lineTotal, 0);
  return Math.abs(lines - invoice.total) <= Math.abs(lines + invoice.tax - invoice.total);
}

function reviewLine(
  line: ScannedLine,
  index: number,
  tax: number,
  invoice: ExtractedInvoice,
  materials: MatchCandidate[],
  basis: ReviewInvoice["costBasis"],
): ReviewLine {
  const sized = line.packSize != null && line.packUnit != null;
  const materialId = line.isMaterial ? matchMaterial(line.description, invoice.supplier, materials) : null;
  const exTax = pricesIncludeTax(invoice) ? line.lineTotal - tax : line.lineTotal;
  const cost = basis === "ex-tax" ? exTax : exTax + tax;
  return {
    key: `line-${index}`,
    description: line.description,
    include: line.isMaterial && line.lineTotal > 0,
    materialId: materialId ?? (line.isMaterial ? "new" : ""),
    quantity: sized ? line.packCount * (line.packSize ?? 1) : line.packCount,
    unit: sized && line.packUnit ? line.packUnit : "EACH",
    totalCents: Math.max(0, Math.round(cost * 100)),
    taxCents: Math.max(0, Math.round(tax * 100)),
    confidence: line.confidence,
  };
}

export function buildReview(
  invoice: ExtractedInvoice,
  ctx: {
    materials: MatchCandidate[];
    region: TaxRegion;
    costBasis: ReviewInvoice["costBasis"];
    today: string;
    receiptUrl: string | null;
    duplicateOf: string | null;
  },
): ReviewInvoice {
  const taxes = lineTaxes(invoice);
  const basis = ctx.region.recoverable ? ctx.costBasis : "inc-tax";
  return {
    supplier: invoice.supplier ?? "",
    invoiceNumber: invoice.invoiceNumber ?? "",
    invoiceDate: invoice.invoiceDate ?? ctx.today,
    currency: invoice.currency,
    totalCents: toCents(invoice.total),
    taxCents: toCents(invoice.tax),
    receiptUrl: ctx.receiptUrl,
    duplicateOf: ctx.duplicateOf,
    costBasis: basis,
    taxLabel: ctx.region.label,
    taxRecoverable: ctx.region.recoverable,
    lines: invoice.lines.map((line, i) => reviewLine(line, i, taxes[i], invoice, ctx.materials, basis)),
  };
}
