import { prisma } from "@/lib/prisma";
import { resolveStandTimezone } from "@/lib/stand-timezone";
import type { CsvRow } from "./parse-csv";

export type DataContext = {
  ownerId: string;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
  stand: { id: string; slug: string; currency: string; timeZone: string };
};

export type RowError = { line: number; message: string };

/** One validated row ready to write; `existingId` set when it updates a record. */
export type PlannedRow<T> = { line: number; existingId: string | null; label: string; data: T };

export type ImportPlan<T> = { rows: PlannedRow<T>[]; errors: RowError[] };

export type ImportResult = { created: number; updated: number; warnings: string[] };

export type Importer<T> = {
  plan(rows: CsvRow[], ctx: DataContext): Promise<ImportPlan<T>>;
  apply(plan: ImportPlan<T>, ctx: DataContext): Promise<ImportResult>;
};

export async function loadDataContext(
  owner: { id: string; stripeAccountId: string | null; stripeChargesEnabled: boolean },
  standId: string,
): Promise<DataContext | null> {
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    select: { id: true, slug: true, currency: true, timezone: true },
  });
  if (!stand) return null;
  return {
    ownerId: owner.id,
    stripeAccountId: owner.stripeAccountId,
    stripeChargesEnabled: owner.stripeChargesEnabled,
    stand: {
      id: stand.id,
      slug: stand.slug,
      currency: stand.currency,
      timeZone: resolveStandTimezone(stand.timezone),
    },
  };
}
