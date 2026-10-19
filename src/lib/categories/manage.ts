import { prisma } from "@/lib/prisma";
import {
  addSiteRenameRedirect,
  clearSiteRedirectFrom,
  retargetSiteLinks,
} from "@/lib/website/persistence/site-redirect-patch";
import {
  isAutoCategorySlug,
  revalidateOwnerStores,
  uniqueCategorySlug,
  validOrderedIds,
  type OrderActionResult,
} from "./category-admin";

const NOT_FOUND = { error: "Category not found." } as const;

export const CATEGORY_TITLE_MAX = 80;

/** New category at the end of the shop menu. */
export async function createOwnerCategory(
  ownerId: string,
  rawTitle: string,
  description: string | null = null,
): Promise<{ id: string } | { error: string }> {
  const title = rawTitle.trim().slice(0, CATEGORY_TITLE_MAX);
  if (!title) return { error: "Enter a category name." };
  const last = await prisma.category.findFirst({
    where: { ownerId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const category = await prisma.category.create({
    data: {
      ownerId,
      title,
      description,
      slug: await uniqueCategorySlug(ownerId, title),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  await clearSiteRedirectFrom(ownerId, `/${category.slug}`);
  await revalidateOwnerStores(ownerId);
  return { id: category.id };
}

export type CategoryUpdate = {
  title: string;
  showOnWebsite: boolean;
  /** Left unchanged when undefined (the app doesn't edit these). */
  description?: string | null;
  bottomDescription?: string | null;
  imageUrl?: string | null;
};

/** Saves the category; an auto-made web address follows a rename, with a redirect from the old one. */
export async function updateOwnerCategory(
  ownerId: string,
  categoryId: string,
  fields: CategoryUpdate,
): Promise<OrderActionResult> {
  const existing = await prisma.category.findFirst({ where: { id: categoryId, ownerId } });
  if (!existing) return NOT_FOUND;
  const title = fields.title.trim().slice(0, CATEGORY_TITLE_MAX);
  if (!title) return { error: "Enter a category name." };

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      title,
      showOnWebsite: fields.showOnWebsite,
      description: fields.description,
      bottomDescription: fields.bottomDescription,
      imageUrl: fields.imageUrl,
      slug:
        title === existing.title || !isAutoCategorySlug(existing.slug, existing.title)
          ? existing.slug
          : await uniqueCategorySlug(ownerId, title, categoryId),
    },
    select: { slug: true },
  });
  if (updated.slug !== existing.slug) {
    await addSiteRenameRedirect(ownerId, `/${existing.slug}`, `/${updated.slug}`);
    await retargetSiteLinks(ownerId, "category", "/", updated.slug, [existing.slug]);
  }
  await revalidateOwnerStores(ownerId);
  return { ok: true };
}

/** Publish or unpublish everywhere it shows (shop, website, QR codes). */
export async function setOwnerCategoryActive(
  ownerId: string,
  categoryId: string,
  isActive: boolean,
): Promise<OrderActionResult> {
  const updated = await prisma.category.updateMany({ where: { id: categoryId, ownerId }, data: { isActive } });
  if (updated.count === 0) return NOT_FOUND;
  await revalidateOwnerStores(ownerId);
  return { ok: true };
}

export async function deleteOwnerCategory(ownerId: string, categoryId: string): Promise<OrderActionResult> {
  const deleted = await prisma.category.deleteMany({ where: { id: categoryId, ownerId } });
  if (deleted.count === 0) return NOT_FOUND;
  await revalidateOwnerStores(ownerId);
  return { ok: true };
}

/** Shop menu order. */
export async function saveOwnerCategoryOrder(ownerId: string, raw: unknown): Promise<OrderActionResult> {
  const ids = validOrderedIds(raw);
  if (!ids) return { error: "Invalid order." };
  await prisma.$transaction(
    ids.map((id, index) => prisma.category.updateMany({ where: { id, ownerId }, data: { sortOrder: index } })),
  );
  await revalidateOwnerStores(ownerId);
  return { ok: true };
}
