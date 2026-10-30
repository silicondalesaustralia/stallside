"use server";

import { requireOwnerWrite } from "@/lib/session";
import { syncOwnerPastOrderTax, updateOwnerTaxSettings } from "@/lib/tax/owner-tax-settings";

export async function updateTaxSettings(formData: FormData): Promise<{ ok: true } | { error: string }> {
  try {
    const { owner } = await requireOwnerWrite();
    return await updateOwnerTaxSettings(owner.id, {
      country: String(formData.get("taxCountry") ?? ""),
      rate: String(formData.get("taxRate") ?? ""),
      taxId: String(formData.get("taxId") ?? ""),
      registered: formData.get("registered") === "on",
      taxShipping: formData.get("taxShipping") === "on",
    });
  } catch (error) {
    console.error("updateTaxSettings failed", error);
    return { error: "Could not save tax settings." };
  }
}

export async function syncPastOrderGst(): Promise<{ message: string }> {
  try {
    const { owner } = await requireOwnerWrite();
    return { message: await syncOwnerPastOrderTax(owner.id) };
  } catch (error) {
    console.error("syncPastOrderGst failed", error);
    return { message: "Could not sync past orders. Try again." };
  }
}
