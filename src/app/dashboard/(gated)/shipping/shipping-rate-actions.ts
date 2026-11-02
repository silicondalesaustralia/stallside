"use server";

import { redirect } from "next/navigation";
import { requireProOwnerWrite } from "@/lib/require-pro-owner";
import { saveOwnerShippingRates } from "@/lib/shipping/settings";

/** Free, flat rate or per-product shipping, plus an optional free-over threshold. */
export async function saveShippingRates(standId: string, formData: FormData) {
  const { owner } = await requireProOwnerWrite();
  const result = await saveOwnerShippingRates(owner.id, standId, {
    shippingMode: formData.get("shippingMode"),
    flat: String(formData.get("shippingFlat") ?? ""),
    freeOver: String(formData.get("shippingFreeOver") ?? ""),
  });
  redirect(`/dashboard/shipping?rates=${"error" in result ? result.code : "saved"}`);
}
