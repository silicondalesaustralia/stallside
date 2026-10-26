"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { syncOwnerOrderGst } from "@/lib/order-gst-sync";
import { taxRegion } from "@/lib/tax/regions";

const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

function isValidAbn(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) return false;
  const sum = digits
    .split("")
    .map(Number)
    .reduce((acc, d, i) => acc + (i === 0 ? d - 1 : d) * ABN_WEIGHTS[i], 0);
  return sum % 89 === 0;
}

function parseRateBps(raw: string): number | null | "invalid" {
  const value = raw.trim().replace("%", "");
  if (!value) return null;
  const pct = Number(value);
  if (!Number.isFinite(pct) || pct < 0 || pct > 30) return "invalid";
  return Math.round(pct * 100);
}

export async function updateTaxSettings(formData: FormData): Promise<{ ok: true } | { error: string }> {
  try {
    const { owner } = await requireOwnerWrite();
    const country = String(formData.get("taxCountry") ?? "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(country)) return { error: "Choose a country." };
    const region = taxRegion(country);
    const registered = formData.get("registered") === "on";
    const parsed = parseRateBps(String(formData.get("taxRate") ?? ""));
    if (parsed === "invalid") return { error: "Enter the rate as a percentage, e.g. 10 or 8.25." };
    const rateBps = parsed === region.defaultRateBps ? null : parsed;
    const taxId = String(formData.get("taxId") ?? "").replace(/\s/g, "");

    if (country === "AU") {
      if (taxId && !isValidAbn(taxId)) return { error: "That ABN doesn't look right - check the 11 digits." };
      if (registered && !taxId) return { error: "Add your ABN to turn on GST." };
    }
    if (registered && (rateBps ?? region.defaultRateBps) == null) {
      return { error: `Enter your ${region.name.toLowerCase()} rate to turn it on.` };
    }

    await prisma.owner.update({
      where: { id: owner.id },
      data: { taxCountry: country, taxRateBps: rateBps, gstRegistered: registered, abn: taxId || null },
    });
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch (error) {
    console.error("updateTaxSettings failed", error);
    return { error: "Could not save tax settings." };
  }
}

export async function syncPastOrderGst(): Promise<{ message: string }> {
  try {
    const { owner } = await requireOwnerWrite();
    const { updated } = await syncOwnerOrderGst(owner.id);
    revalidatePath("/dashboard/orders");
    return {
      message: updated
        ? `Synced tax on ${updated} past order${updated === 1 ? "" : "s"}.`
        : "Past orders are already up to date.",
    };
  } catch (error) {
    console.error("syncPastOrderGst failed", error);
    return { message: "Could not sync past orders. Try again." };
  }
}
