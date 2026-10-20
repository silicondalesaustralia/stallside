import { revalidatePath, revalidateTag } from "next/cache";
import type { ShippingSettingsValues } from "@/contracts/mobile/shipping";
import { prisma } from "@/lib/prisma";
import { dollarsToCents } from "@/lib/money";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { parseFulfilmentChoice } from "@/lib/fulfilment/handover-choice";
import { parseShippingMode } from "@/lib/shipping/shipping-cost";

/** `code` matches the web page's ?fulfilment= / ?rates= status values. */
export type ShippingSaveResult = { ok: true } | { error: string; code: "invalid" | "flat" | "error" };

const INVALID = { error: "Check the amounts and try again.", code: "invalid" } as const;
const FAILED = { error: "Could not save. Try again.", code: "error" } as const;

function dollars(cents: number | null): string {
  return cents ? (cents / 100).toFixed(2) : "";
}

function optionalCents(raw: string): number | null | "invalid" {
  const text = raw.trim();
  if (!text) return null;
  try {
    const cents = dollarsToCents(text);
    return cents >= 0 ? cents : "invalid";
  } catch {
    return "invalid";
  }
}

/** Current settings as form values, plus the currency; null if the business isn't the owner's. */
export async function getOwnerShippingSettings(ownerId: string, standId: string) {
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId },
    select: {
      currency: true,
      fulfilmentDefault: true,
      shippingMode: true,
      shippingFlatCents: true,
      shippingFreeOverCents: true,
    },
  });
  if (!stand) return null;
  const settings: ShippingSettingsValues = {
    fulfilmentDefault: stand.fulfilmentDefault,
    shippingMode: stand.shippingMode,
    flat: dollars(stand.shippingFlatCents),
    freeOver: dollars(stand.shippingFreeOverCents),
  };
  return { currency: stand.currency, settings };
}

async function updateStand(ownerId: string, standId: string, data: Parameters<typeof prisma.stand.update>[0]["data"]) {
  const stand = await prisma.stand.findFirst({ where: { id: standId, ownerId }, select: { slug: true } });
  if (!stand) return INVALID;
  try {
    await prisma.stand.update({ where: { id: standId }, data });
  } catch (error) {
    console.error("[shipping] save failed", error);
    return FAILED;
  }
  revalidateTag(standCatalogTag(stand.slug), "max");
  revalidatePath("/dashboard/shipping");
  revalidatePath("/dashboard/products", "layout");
  return { ok: true } as const;
}

/** Site-wide pickup / delivery for a business's take-now products. */
export async function saveOwnerFulfilmentDefault(ownerId: string, standId: string, raw: unknown): Promise<ShippingSaveResult> {
  const choice = parseFulfilmentChoice(raw);
  if (!choice) return { error: "Choose pickup, delivery or both.", code: "invalid" };
  return updateStand(ownerId, standId, { fulfilmentDefault: choice });
}

/** Free, flat rate or per-product shipping, plus an optional free-over threshold. */
export async function saveOwnerShippingRates(
  ownerId: string,
  standId: string,
  input: { shippingMode: unknown; flat: string; freeOver: string },
): Promise<ShippingSaveResult> {
  const mode = parseShippingMode(input.shippingMode);
  const flat = optionalCents(input.flat);
  const freeOver = optionalCents(input.freeOver);
  if (!mode || flat === "invalid" || freeOver === "invalid") return INVALID;
  if (mode === "FLAT" && !flat) return { error: "Enter the flat rate amount.", code: "flat" };
  return updateStand(ownerId, standId, {
    shippingMode: mode,
    shippingFlatCents: flat ?? 0,
    shippingFreeOverCents: freeOver,
  });
}
