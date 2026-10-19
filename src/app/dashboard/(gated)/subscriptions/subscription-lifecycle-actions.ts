"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { deleteOwnerOffer, setOwnerOfferActive } from "@/lib/subscriptions/service";

export async function setSubscriptionOfferActive(
  offerId: string,
  isActive: boolean,
) {
  const { owner } = await requireOwnerWrite();
  return setOwnerOfferActive(owner.id, offerId, isActive);
}

export async function deleteSubscriptionOffer(offerId: string) {
  const { owner } = await requireOwnerWrite();
  const result = await deleteOwnerOffer(owner.id, offerId);
  if ("error" in result) return result;
  redirect("/dashboard/subscriptions");
}
