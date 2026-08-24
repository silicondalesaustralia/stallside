"use server";

import { signOut } from "@/lib/auth";
import { requireOwnerWrite } from "@/lib/session";
import { wipeOwnerAccount } from "@/lib/wipe-owner-account";

/** Soft-close account: cancel billing, retain data, stop login/emails, sign out. */
export async function deleteAccount() {
  const { owner } = await requireOwnerWrite();
  const result = await wipeOwnerAccount(owner.id);
  if ("error" in result && result.error) return result;
  await signOut({ redirectTo: "/" });
}
