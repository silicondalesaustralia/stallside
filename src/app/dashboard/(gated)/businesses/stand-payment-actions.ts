"use server";

import { requireOwnerWrite } from "@/lib/session";
import { saveOwnerStandPayments } from "@/lib/stand-payments/service";

export async function updateStandPayments(standId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  return saveOwnerStandPayments(owner, standId, {
    acceptCash: formData.get("acceptCash") === "on",
    acceptLocalTransfer: formData.get("acceptLocalTransfer") === "on",
    localTransferAlias: String(formData.get("localTransferAlias") ?? ""),
    acceptCard: formData.get("acceptCard") === "on",
    acceptPayPal: formData.get("acceptPayPal") === "on",
    acceptSquare: formData.get("acceptSquare") === "on",
  });
}
