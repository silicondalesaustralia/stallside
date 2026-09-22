"use server";

import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveCampaignAudience } from "@/lib/grow/campaigns";

/** Members of a saved list for the include/exclude picker. */
export async function loadListMembers(listId: string) {
  const { owner } = await requireOwner();
  const id = listId.trim();
  if (!id) {
    return { error: "List required.", members: [] as { email: string }[] };
  }

  const list = await prisma.customerSegment.findFirst({
    where: { id, ownerId: owner.id, isActive: true },
    select: { id: true },
  });
  if (!list) {
    return { error: "List not found.", members: [] as { email: string }[] };
  }

  const audience = await resolveCampaignAudience({
    ownerId: owner.id,
    audienceType: "list",
    audienceRefId: list.id,
  });
  return { members: audience.map((m) => ({ email: m.email })) };
}
