"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { createLifetimeInvite } from "@/lib/lifetime-invite";

export async function createLifetimeInviteAction(formData: FormData) {
  await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();
  const invite = await createLifetimeInvite(note || undefined);
  redirect(`/admin/invites?created=${encodeURIComponent(invite.token)}`);
}
