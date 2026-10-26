import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { prisma } from "@/lib/prisma";
import { toDateInputValue } from "@/lib/date-range";
import { taxConfig, type TaxConfig } from "@/lib/tax/config";

export type ProductionScope = {
  ownerId: string;
  stand: { id: string; name: string; slug: string; timezone: string; currency: string } | null;
  today: string;
  tax: TaxConfig;
};

/** Owner plus the selected business (with its currency) for production pages. */
export async function loadProductionScope(): Promise<ProductionScope> {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) {
    return { ownerId: owner.id, stand: null, today: toDateInputValue(new Date()), tax: taxConfig(owner, "AUD") };
  }
  const stand = await prisma.stand.findUnique({
    where: { id: selected.id },
    select: { currency: true },
  });
  const currency = stand?.currency ?? "AUD";
  return {
    ownerId: owner.id,
    stand: { ...selected, currency },
    today: toDateInputValue(new Date(), selected.timezone),
    tax: taxConfig(owner, currency),
  };
}
