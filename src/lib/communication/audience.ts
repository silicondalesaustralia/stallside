import { AUDIENCE_TYPES, type CommunicationAudience } from "@/contracts/mobile/communication";
import { prisma } from "@/lib/prisma";
import { resolveCampaignAudience } from "@/lib/grow/campaigns";

export type ResolvedAudience = {
  audienceType: string;
  audienceRefId: string | null;
  emailAllowlist: string[] | null;
};

/** Checks the chosen people/list/page/products belong to the owner and returns what the sender needs. */
export async function resolveOwnerAudience(
  ownerId: string,
  a: CommunicationAudience,
): Promise<{ ok: true; value: ResolvedAudience } | { error: string }> {
  if (!AUDIENCE_TYPES.includes(a.audienceType)) return { error: "Choose who to email." };
  let audienceRefId: string | null = null;

  if (a.audienceType === "customer") {
    if (!a.customerId) return { error: "Choose a customer." };
    const c = await prisma.customer.findFirst({ where: { id: a.customerId, ownerId }, select: { id: true } });
    if (!c) return { error: "Customer not found." };
    audienceRefId = c.id;
  }
  if (a.audienceType === "list") {
    if (!a.listId) return { error: "Choose a list." };
    const list = await prisma.customerSegment.findFirst({
      where: { id: a.listId, ownerId, isActive: true },
      select: { id: true },
    });
    if (!list) return { error: "List not found." };
    audienceRefId = list.id;
  }
  if (a.audienceType === "preorder_page") {
    if (!a.preOrderPageId) return { error: "Choose a pre-order page." };
    const page = await prisma.preOrderPage.findFirst({
      where: { id: a.preOrderPageId, ownerId },
      select: { id: true },
    });
    if (!page) return { error: "Pre-order page not found." };
    audienceRefId = page.id;
  }
  if (a.audienceType === "product") {
    if (a.productIds.length === 0) return { error: "Choose at least one product." };
    const owned = await prisma.product.findMany({
      where: { ownerId, id: { in: a.productIds } },
      select: { id: true },
    });
    if (owned.length === 0) return { error: "Product not found." };
    audienceRefId = owned.map((p) => p.id).join(",");
  }

  const emailAllowlist =
    a.audienceType === "list"
      ? a.recipientEmails.map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@"))
      : null;
  if (emailAllowlist && emailAllowlist.length === 0) return { error: "Select at least one email on the list." };

  return { ok: true, value: { audienceType: a.audienceType, audienceRefId, emailAllowlist } };
}

/** How many people would receive it right now (unsubscribed contacts excluded). */
export async function countOwnerAudience(ownerId: string, a: CommunicationAudience) {
  const resolved = await resolveOwnerAudience(ownerId, a);
  if ("error" in resolved) return resolved;
  const members = await resolveCampaignAudience({ ownerId, ...resolved.value });
  return { ok: true as const, count: members.length };
}

/** Emails on a saved list, for ticking who gets a message. */
export async function listOwnerListMembers(ownerId: string, listId: string) {
  const list = await prisma.customerSegment.findFirst({
    where: { id: listId.trim(), ownerId, isActive: true },
    select: { id: true },
  });
  if (!list) return null;
  const audience = await resolveCampaignAudience({ ownerId, audienceType: "list", audienceRefId: list.id });
  return audience.map((m) => m.email);
}
