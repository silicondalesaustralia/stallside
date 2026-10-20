"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { saveOwnerFulfilmentDefault } from "@/lib/shipping/settings";

/** Site-wide pickup / delivery for a business's take-now products. */
export async function saveFulfilmentDefault(standId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const result = await saveOwnerFulfilmentDefault(owner.id, standId, formData.get("fulfilmentDefault"));
  redirect(`/dashboard/shipping?fulfilment=${"error" in result ? result.code : "saved"}`);
}
