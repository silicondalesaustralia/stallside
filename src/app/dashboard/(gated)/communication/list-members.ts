"use server";

import { requireOwner } from "@/lib/session";
import { listOwnerListMembers } from "@/lib/communication/audience";

/** Members of a saved list for the include/exclude picker. */
export async function loadListMembers(listId: string) {
  const { owner } = await requireOwner();
  if (!listId.trim()) {
    return { error: "List required.", members: [] as { email: string }[] };
  }
  const emails = await listOwnerListMembers(owner.id, listId);
  if (!emails) {
    return { error: "List not found.", members: [] as { email: string }[] };
  }
  return { members: emails.map((email) => ({ email })) };
}
