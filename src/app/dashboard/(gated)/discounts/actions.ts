"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import type { DiscountInput } from "@/lib/discounts/input";
import { saveOwnerDiscount } from "@/lib/discounts/save";
import { deleteOwnerDiscount } from "@/lib/discounts/manage";

export type DiscountActionResult = { error: string } | { ok: true };

/** Creates (id null) or updates a discount code for the selected business. */
export async function saveDiscount(id: string | null, input: DiscountInput): Promise<DiscountActionResult> {
  const { owner } = await requireOwnerWrite();
  const newStandId = id ? null : (await resolveSelectedBusiness(owner.id)).selected?.id;
  const result = await saveOwnerDiscount(owner.id, id, input, newStandId);
  if ("error" in result) return result;
  redirect("/dashboard/discounts");
}

export async function deleteDiscount(id: string): Promise<DiscountActionResult> {
  const { owner } = await requireOwnerWrite();
  const result = await deleteOwnerDiscount(owner.id, id);
  if ("error" in result) return result;
  redirect("/dashboard/discounts");
}
