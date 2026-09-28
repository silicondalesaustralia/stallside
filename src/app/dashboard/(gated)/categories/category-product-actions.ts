"use server";

import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  revalidateOwnerStores,
  validOrderedIds,
  type OrderActionResult,
} from "@/lib/categories/category-admin";

async function ownedCategory(ownerId: string, categoryId: string) {
  return prisma.category.findFirst({
    where: { id: categoryId, ownerId },
    select: { id: true },
  });
}

/** Order of products inside one category (ProductCategory.sortOrder). */
export async function saveCategoryProductOrder(
  categoryId: string,
  raw: string[],
): Promise<OrderActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const ids = validOrderedIds(raw);
    if (!ids) return { error: "Invalid order." };
    if (!(await ownedCategory(owner.id, categoryId))) return { error: "Category not found." };
    await prisma.$transaction(
      ids.map((productId, index) =>
        prisma.productCategory.updateMany({
          where: { categoryId, productId },
          data: { sortOrder: index },
        }),
      ),
    );
    await revalidateOwnerStores(owner.id);
    return { ok: true };
  } catch (error) {
    console.error("saveCategoryProductOrder failed", error);
    return { error: "Could not save order." };
  }
}

/** Replace a category's product set from checkboxes; new products go last. */
export async function setCategoryProducts(
  categoryId: string,
  formData: FormData,
): Promise<OrderActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    if (!(await ownedCategory(owner.id, categoryId))) return { error: "Category not found." };
    const wanted = formData.getAll("productId").map(String);
    const owned = await prisma.product.findMany({
      where: { ownerId: owner.id, id: { in: wanted } },
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
      prisma.productCategory.deleteMany({
        where: { categoryId, productId: { notIn: [...keep] } },
      }),
      prisma.productCategory.createMany({
        data: [...keep]
          .filter((id) => !have.has(id))
          .map((productId) => ({ categoryId, productId, sortOrder: next++ })),
        skipDuplicates: true,
      }),
    ]);
    await revalidateOwnerStores(owner.id);
    return { ok: true };
  } catch (error) {
    console.error("setCategoryProducts failed", error);
    return { error: "Could not update products." };
  }
}

/** Product edit page: which categories this product belongs to. */
export async function setProductCategories(
  productId: string,
  formData: FormData,
): Promise<OrderActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const product = await prisma.product.findFirst({
      where: { id: productId, ownerId: owner.id },
      select: { id: true },
    });
    if (!product) return { error: "Product not found." };
    const wanted = formData.getAll("categoryId").map(String);
    const categories = await prisma.category.findMany({
      where: { ownerId: owner.id, id: { in: wanted } },
      select: { id: true, products: { select: { sortOrder: true }, orderBy: { sortOrder: "desc" }, take: 1 } },
    });
    const keep = categories.map((c) => c.id);

    await prisma.$transaction([
      prisma.productCategory.deleteMany({
        where: { productId, categoryId: { notIn: keep } },
      }),
      prisma.productCategory.createMany({
        data: categories.map((c) => ({
          productId,
          categoryId: c.id,
          sortOrder: (c.products[0]?.sortOrder ?? -1) + 1,
        })),
        skipDuplicates: true,
      }),
    ]);
    await revalidateOwnerStores(owner.id);
    return { ok: true };
  } catch (error) {
    console.error("setProductCategories failed", error);
    return { error: "Could not save categories." };
  }
}
