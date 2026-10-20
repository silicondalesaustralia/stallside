"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { saveOwnerShippingRates } from "@/lib/shipping/settings";

/** Free, flat rate or per-product shipping, plus an optional free-over threshold. */
export async function saveShippingRates(standId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const result = await saveOwnerShippingRates(owner.id, standId, {
    shippingMode: formData.get("shippingMode"),
    flat: String(formData.get("shippingFlat") ?? ""),
    freeOver: String(formData.get("shippingFreeOver") ?? ""),
  });
  redirect(`/dashboard/shipping?rates=${"error" in result ? result.code : "saved"}`);
}
