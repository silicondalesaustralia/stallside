"use server";

import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidateOwnerStores, type OrderActionResult } from "@/lib/categories/category-admin";
import { saveOwnerCategoryProductOrder, setOwnerCategoryProducts } from "@/lib/categories/products";

/** Order of products inside one category (ProductCategory.sortOrder). */
export async function saveCategoryProductOrder(
  categoryId: string,
  raw: string[],
): Promise<OrderActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    return await saveOwnerCategoryProductOrder(owner.id, categoryId, raw);
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
    return await setOwnerCategoryProducts(owner.id, categoryId, formData.getAll("productId").map(String));
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
    const chosen = String(formData.get("primaryCategoryId") ?? "");
    const primaryCategoryId = keep.includes(chosen) ? chosen : (keep[0] ?? null);

    await prisma.$transaction([
      prisma.product.update({ where: { id: productId }, data: { primaryCategoryId } }),
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
