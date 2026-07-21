"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { createLifetimeInvite } from "@/lib/lifetime-invite";

export async function createLifetimeInviteAction(formData: FormData) {
  await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();
  const maxUsesRaw = Number(formData.get("maxUses"));
  const maxUses = Number.isFinite(maxUsesRaw) ? maxUsesRaw : 1;
  const invite = await createLifetimeInvite({
    note: note || undefined,
    maxUses,
  });
  redirect(`/admin/invites?created=${encodeURIComponent(invite.token)}`);
}
