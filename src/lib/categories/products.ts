import { prisma } from "@/lib/prisma";
import { revalidateOwnerStores, validOrderedIds, type OrderActionResult } from "./category-admin";

async function ownedCategory(ownerId: string, categoryId: string) {
  return prisma.category.findFirst({ where: { id: categoryId, ownerId }, select: { id: true } });
}

/** Order of products inside one category (ProductCategory.sortOrder). */
export async function saveOwnerCategoryProductOrder(
  ownerId: string,
  categoryId: string,
  raw: unknown,
): Promise<OrderActionResult> {
  const ids = validOrderedIds(raw);
  if (!ids) return { error: "Invalid order." };
  if (!(await ownedCategory(ownerId, categoryId))) return { error: "Category not found." };
  await prisma.$transaction(
    ids.map((productId, index) =>
      prisma.productCategory.updateMany({ where: { categoryId, productId }, data: { sortOrder: index } }),
    ),
  );
  await revalidateOwnerStores(ownerId);
  return { ok: true };
}

/** Replaces a category's products; new ones go last, products the owner doesn't own are ignored. */
export async function setOwnerCategoryProducts(
  ownerId: string,
  categoryId: string,
  wanted: string[],
): Promise<OrderActionResult> {
  if (!(await ownedCategory(ownerId, categoryId))) return { error: "Category not found." };
  const owned = await prisma.product.findMany({
    where: { ownerId, id: { in: wanted } },
    select: { id: true },
  });
  const keep = new Set(owned.map((p) => p.id));
  const existing = await prisma.productCategory.findMany({
    where: { categoryId },
    select: { productId: true, sortOrder: true },
  });
  const have = new Set(existing.map((l) => l.productId));
  let next = existing.reduce((max, l) => Math.max(max, l.sortOrder), -1) + 1;

  await prisma.$transaction([
    prisma.productCategory.deleteMany({ where: { categoryId, productId: { notIn: [...keep] } } }),
    prisma.productCategory.createMany({
      data: [...keep].filter((id) => !have.has(id)).map((productId) => ({ categoryId, productId, sortOrder: next++ })),
      skipDuplicates: true,
    }),
  ]);
  await revalidateOwnerStores(ownerId);
  return { ok: true };
}
