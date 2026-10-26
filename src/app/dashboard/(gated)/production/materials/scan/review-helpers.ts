import type { ReviewInvoice, ReviewLine, SaveInvoiceInput } from "@/lib/production/invoice-scan/schema";
import { compatibleUnits, MEASURE_UNITS, type Unit } from "@/lib/production/unit-convert";

export type ScanMaterial = { id: string; name: string; baseUnit: Unit };

/** Recipe unit for a new material bought in `unit` (grams, millilitres or each). */
export function defaultBaseUnit(unit: Unit): Unit {
  const family = compatibleUnits(unit);
  if (family.includes("G")) return "G";
  if (family.includes("ML")) return "ML";
  return "EACH";
}

export function unitOptions(line: ReviewLine, materials: ScanMaterial[]): readonly Unit[] {
  const material = materials.find((m) => m.id === line.materialId);
  return material ? compatibleUnits(material.baseUnit) : MEASURE_UNITS;
}

export function lineProblem(line: ReviewLine, materials: ScanMaterial[]): string | null {
  if (!line.include) return null;
  if (!line.materialId) return "Choose a material";
  if (!(line.quantity > 0)) return "Enter a quantity";
  if (!unitOptions(line, materials).includes(line.unit)) return "Unit doesn't match the material";
  return null;
}

export function includedTotalCents(lines: ReviewLine[]): number {
  return lines.filter((l) => l.include).reduce((sum, l) => sum + l.totalCents, 0);
}

export function toSaveInput(invoice: ReviewInvoice): SaveInvoiceInput {
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
        newBaseUnit: l.materialId === "new" ? defaultBaseUnit(l.unit) : undefined,
        quantity: l.quantity,
        unit: l.unit,
        totalCents: l.totalCents,
      })),
  };
}
