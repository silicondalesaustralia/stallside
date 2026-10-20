"use server";

import { requireOwnerWrite } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { inviteOwnerSupplier } from "@/lib/suppliers/members";

export async function inviteSupplier(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) return { error: "Choose a stand first." };
  return inviteOwnerSupplier(
    owner,
    selected,
    String(formData.get("name") ?? ""),
    String(formData.get("email") ?? ""),
  );
}
