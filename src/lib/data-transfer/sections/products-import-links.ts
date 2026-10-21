import { prisma } from "@/lib/prisma";
import { ProductChannelType } from "@/generated/prisma/client";
import { ensureDefaultProductChannels } from "@/lib/catalogue/channels";
import type { DataContext } from "../context";

/** Category ids for slugs; missing categories are created (titled from the slug). */
export async function categoryIdsForSlugs(
  slugs: string[],
  ctx: DataContext,
  cache: Map<string, string>,
  warn: (message: string) => void,
): Promise<string[]> {
  const ids: string[] = [];
  for (const slug of slugs) {
    let id = cache.get(slug);
    if (!id) {
      const found = await prisma.category.findUnique({
        where: { ownerId_slug: { ownerId: ctx.ownerId, slug } },
        select: { id: true },
      });
      id =
        found?.id ??
        (
          await prisma.category.create({
            data: {
              ownerId: ctx.ownerId,
              slug,
              title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            },
            select: { id: true },
          })
        ).id;
      if (!found) warn(`Created category "${slug}" (it was not in your categories yet)`);
      cache.set(slug, id);
    }
    ids.push(id);
  }
  return ids;
}

export async function replaceProductCategories(productId: string, categoryIds: string[]) {
  await prisma.$transaction([
    prisma.productCategory.deleteMany({ where: { productId } }),
    prisma.productCategory.createMany({
      data: categoryIds.map((categoryId, sortOrder) => ({ productId, categoryId, sortOrder })),
    }),
  ]);
}

/** Default channels for new products, then the CSV's explicit on/off choices. */
export async function syncProductChannels(
  productId: string,
  ctx: DataContext,
  isNew: boolean,
  choice: { sellAtStand?: boolean; sellOnline?: boolean },
) {
  if (isNew) {
    await ensureDefaultProductChannels({ productId, standId: ctx.stand.id, ownerId: ctx.ownerId });
  }
  const wanted: [ProductChannelType, boolean | undefined][] = [
    [ProductChannelType.STAND, choice.sellAtStand],
    [ProductChannelType.ONLINE, choice.sellOnline],
  ];
  for (const [channelType, isEnabled] of wanted) {
    if (isEnabled === undefined) continue;
    await prisma.productChannel.upsert({
      where: {
        productId_channelType_standId: { productId, channelType, standId: ctx.stand.id },
      },
      create: { productId, channelType, standId: ctx.stand.id, isEnabled },
      update: { isEnabled },
    });
  }
}
