"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FulfilmentStatus } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { setOrdersOpsStatus } from "@/lib/ops/board";

export async function markLookupOrderCollected(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const orderId = String(formData.get("orderId") ?? "");
  const token = String(formData.get("token") ?? "");
  const result = await setOrdersOpsStatus({
    ownerId: owner.id,
    orderIds: [orderId],
    status: FulfilmentStatus.COLLECTED,
  });
  if (result.errors.length) {
    throw new Error(result.errors[0] ?? "Could not mark collected");
  }
  revalidatePath(`/dashboard/ops/lookup/${token}`);
  revalidatePath("/dashboard/fulfilment/orders");
  redirect(`/dashboard/ops/lookup/${token}?done=1`);
}
