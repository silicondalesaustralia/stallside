import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { formatCollectionLabel, formatOrderByLabel } from "@/lib/pre-order";

export type UpcomingMenuView = {
  slug: string;
  title: string;
  description: string | null;
  orderByLabel: string | null;
  collectionLabel: string | null;
};

export async function loadUpcomingMenusForStorefront(input: {
  ownerId: string;
  standId: string;
  timeZone: string;
  limit?: number;
}): Promise<UpcomingMenuView[]> {
  const menus = await prisma.menu.findMany({
    where: {
      ownerId: input.ownerId,
      standId: input.standId,
      isActive: true,
      showOnShop: true,
    },
    orderBy: [{ orderByAt: "asc" }, { title: "asc" }],
    select: {
      slug: true,
      title: true,
      description: true,
      kind: true,
      orderByAt: true,
      collectionAt: true,
    },
    take: input.limit ?? 6,
  });

  const now = Date.now();
  return menus
    .filter(
      (m) =>
        m.kind === MenuKind.ALWAYS_AVAILABLE ||
        (m.orderByAt && m.orderByAt.getTime() > now),
    )
    .map((m) => ({
      slug: m.slug,
      title: m.title,
      description: m.description,
      orderByLabel:
        m.orderByAt && m.kind !== MenuKind.ALWAYS_AVAILABLE
          ? formatOrderByLabel(m.orderByAt, input.timeZone)
          : null,
      collectionLabel:
        m.collectionAt && m.kind !== MenuKind.ALWAYS_AVAILABLE
          ? formatCollectionLabel(m.collectionAt, input.timeZone)
          : null,
    }));
}
