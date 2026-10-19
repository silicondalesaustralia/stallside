"use server";

import { requireOwnerWrite } from "@/lib/session";
import { advanceOwnerCollection } from "@/lib/collections/advance-status";

export async function advanceCollectionStatus(orderId: string) {
  const { owner } = await requireOwnerWrite();
  return advanceOwnerCollection(owner.id, orderId);
}
