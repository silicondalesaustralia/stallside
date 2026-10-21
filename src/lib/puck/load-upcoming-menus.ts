import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { formatCollectionLabel, formatOrderByLabel } from "@/lib/pre-order";

export type UpcomingMenuView = {
  slug: string;
  title: string;
  description: string | null;
  isPreOrderDrop: boolean;
  orderByLabel: string | null;
  /** ISO time orders close, for live countdowns. */
  orderByAt: string | null;
  collectionLabel: string | null;
};

/** Upcoming menus and open pre-order pages for the Next drop section. */
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
  const pages = await prisma.preOrderPage.findMany({
    where: { standId: input.standId, isActive: true, orderByAt: { gt: new Date(now) } },
    orderBy: { orderByAt: "asc" },
    select: { slug: true, title: true, description: true, orderByAt: true, collectionAt: true },
    take: input.limit ?? 6,
  });
  const pageViews: UpcomingMenuView[] = pages.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    isPreOrderDrop: true,
    orderByLabel: formatOrderByLabel(p.orderByAt, input.timeZone),
    orderByAt: p.orderByAt.toISOString(),
    collectionLabel: formatCollectionLabel(p.collectionAt, input.timeZone),
  }));
  const menuViews: UpcomingMenuView[] = menus
    .filter(
      (m) =>
        m.kind === MenuKind.ALWAYS_AVAILABLE ||
        (m.orderByAt && m.orderByAt.getTime() > now),
    )
    .map((m) => ({
      slug: m.slug,
      title: m.title,
      description: m.description,
      isPreOrderDrop: m.kind !== MenuKind.ALWAYS_AVAILABLE,
      orderByLabel:
        m.orderByAt && m.kind !== MenuKind.ALWAYS_AVAILABLE
          ? formatOrderByLabel(m.orderByAt, input.timeZone)
          : null,
      orderByAt: m.orderByAt && m.kind !== MenuKind.ALWAYS_AVAILABLE ? m.orderByAt.toISOString() : null,
      collectionLabel:
        m.collectionAt && m.kind !== MenuKind.ALWAYS_AVAILABLE
          ? formatCollectionLabel(m.collectionAt, input.timeZone)
          : null,
    }));
  // Dated drops first (soonest close), then always-available menus.
  return [...menuViews, ...pageViews]
    .sort((x, y) => (x.orderByAt ?? "9999").localeCompare(y.orderByAt ?? "9999"))
    .slice(0, input.limit ?? 6);
}
