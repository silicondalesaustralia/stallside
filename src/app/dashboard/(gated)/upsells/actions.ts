"use server";

import { redirect } from "next/navigation";
import type { UpsellInputValues } from "@/contracts/mobile/upsells";
import { requireProOwnerWrite } from "@/lib/require-pro-owner";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { deleteOwnerUpsell, saveOwnerUpsell } from "@/lib/upsells/save";

export type UpsellInput = UpsellInputValues;
export type UpsellActionResult = { error: string } | { ok: true };

/** Creates (id null) or updates an upsell for the selected business. */
export async function saveUpsell(id: string | null, input: UpsellInput): Promise<UpsellActionResult> {
  const { owner } = await requireProOwnerWrite();
  const newStandId = id ? null : (await resolveSelectedBusiness(owner.id)).selected?.id;
  const result = await saveOwnerUpsell(owner.id, id, input, newStandId);
  if ("error" in result) return result;
  redirect("/dashboard/upsells");
}

export async function deleteUpsell(id: string): Promise<UpsellActionResult> {
  const { owner } = await requireProOwnerWrite();
  const result = await deleteOwnerUpsell(owner.id, id);
  if ("error" in result) return result;
  redirect("/dashboard/upsells");
}
