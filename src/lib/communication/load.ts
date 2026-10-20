import { prisma } from "@/lib/prisma";
import { ensureStandingLists } from "@/lib/crm/standing-lists";
import { countSegmentAudience, parseSegmentRules } from "@/lib/crm/segments";
import { STANDING_LIST_PRESET_KEYS } from "@/lib/crm/segment-rules";
import { listEmailableCustomers } from "@/lib/crm/list-emailable-customers";

/** Latest 50 messages. */
export function listOwnerCampaigns(ownerId: string) {
  return prisma.campaign.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/** Auto-updating lists (creating any that are missing) with how many contacts each has now. */
export async function listOwnerStandingLists(ownerId: string) {
  await ensureStandingLists(ownerId);
  const lists = await prisma.customerSegment.findMany({
    where: { ownerId, isActive: true, presetKey: { in: [...STANDING_LIST_PRESET_KEYS] } },
    orderBy: { name: "asc" },
  });
  return Promise.all(
    lists.map(async (list) => ({
      id: list.id,
      name: list.name,
      description: list.description,
      count: await countSegmentAudience(ownerId, parseSegmentRules(list.rules)),
    })),
  );
}

/** One message with its first 100 recipients. */
export function getOwnerCampaign(ownerId: string, campaignId: string) {
  return prisma.campaign.findFirst({
    where: { id: campaignId, ownerId },
    include: {
      recipients: {
        orderBy: { createdAt: "asc" },
        take: 100,
        select: { email: true, status: true, errorMessage: true },
      },
    },
  });
}

/** Everything the composer can pick from. */
export async function loadComposeOptions(ownerId: string) {
  await ensureStandingLists(ownerId);
  const [customers, products, lists, preOrderPages] = await Promise.all([
    listEmailableCustomers(ownerId),
    prisma.product.findMany({
      where: { ownerId, isArchived: false, isHidden: false },
      orderBy: { name: "asc" },
      take: 300,
      select: { id: true, name: true },
    }),
    prisma.customerSegment.findMany({
      where: { ownerId, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.preOrderPage.findMany({
      where: { ownerId },
      orderBy: [{ isActive: "desc" }, { collectionAt: "desc" }],
      take: 100,
      select: { id: true, title: true },
    }),
  ]);
  return { customers, products, lists, preOrderPages };
}
