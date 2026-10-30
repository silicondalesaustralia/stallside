import type {
  InvoiceReview,
  InvoiceReviewLine,
  InvoiceScanResponse,
  SaveInvoiceBody,
} from "@contracts/mobile/invoice-scan";
import {
  compatibleMaterialUnits,
  MATERIAL_UNITS,
  type MaterialUnit,
} from "@contracts/mobile/material-units";

export type ScanMaterial = InvoiceScanResponse["materials"][number];

/** Recipe unit for a new material bought in `unit` (grams, millilitres or each). */
function defaultBaseUnit(unit: MaterialUnit): MaterialUnit {
  const family = compatibleMaterialUnits(unit);
  if (family.includes("G")) return "G";
  if (family.includes("ML")) return "ML";
  return "EACH";
}

export function unitOptions(
  line: InvoiceReviewLine,
  materials: ScanMaterial[],
): readonly MaterialUnit[] {
  const material = materials.find((m) => m.id === line.materialId);
  return material ? compatibleMaterialUnits(material.baseUnit) : MATERIAL_UNITS;
}

export function lineProblem(
  line: InvoiceReviewLine,
  materials: ScanMaterial[],
): string | null {
  if (!line.include) return null;
  if (!line.materialId) return "Choose a material";
  if (!(line.quantity > 0)) return "Enter a quantity";
  if (!unitOptions(line, materials).includes(line.unit))
    return "Unit doesn't match the material";
  return null;
}

/** Moves every line between ex-tax and inc-tax costs, keeping any edits the owner made. */
export function switchBasis(
  invoice: InvoiceReview,
  basis: InvoiceReview["costBasis"],
): InvoiceReview {
  if (basis === invoice.costBasis) return invoice;
  const sign = basis === "ex-tax" ? -1 : 1;
  return {
    ...invoice,
    costBasis: basis,
    lines: invoice.lines.map((l) => ({
      ...l,
      totalCents: Math.max(0, l.totalCents + sign * l.taxCents),
    })),
  };
}

export function includedTotalCents(lines: InvoiceReviewLine[]): number {
  return lines.filter((l) => l.include).reduce((s, l) => s + l.totalCents, 0);
}

export function basisLabel(invoice: InvoiceReview): string {
  return `${invoice.costBasis === "ex-tax" ? "ex" : "inc"} ${invoice.taxLabel}`;
}

/** The invoice total in the current cost basis, to compare with the ticked lines. */
export function invoiceTotalCents(invoice: InvoiceReview): number | null {
  if (invoice.totalCents == null) return null;
  return invoice.costBasis === "ex-tax"
    ? invoice.totalCents - (invoice.taxCents ?? 0)
    : invoice.totalCents;
}

export function totalsMismatch(invoice: InvoiceReview): boolean {
  const total = invoiceTotalCents(invoice);
  if (total == null) return false;
  const included = includedTotalCents(invoice.lines);
  return Math.abs(total - included) > Math.max(100, total * 0.02);
}

export function toSaveBody(invoice: InvoiceReview): SaveInvoiceBody {
  return {
    supplier: invoice.supplier,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    receiptUrl: invoice.receiptUrl,
    lines: invoice.lines
      .filter((l) => l.include)
      .map((l) => ({
        description: l.description,
        materialId: l.materialId,
        newBaseUnit:
          l.materialId === "new" ? defaultBaseUnit(l.unit) : undefined,
        quantity: l.quantity,
        unit: l.unit,
        totalCents: l.totalCents,
      })),
  };
}
