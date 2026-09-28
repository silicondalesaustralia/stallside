"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  revalidateOwnerStores,
  uniqueCategorySlug,
  validOrderedIds,
  type OrderActionResult,
} from "@/lib/categories/category-admin";

function readFields(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim().slice(0, 80),
    description: String(formData.get("description") ?? "").trim().slice(0, 300) || null,
  };
}

export async function createCategory(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const { title, description } = readFields(formData);
  if (!title) redirect("/dashboard/categories?error=name");
  const last = await prisma.category.findFirst({
    where: { ownerId: owner.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const category = await prisma.category.create({
    data: {
      ownerId: owner.id,
      title,
      description,
      slug: await uniqueCategorySlug(owner.id, title),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  await revalidateOwnerStores(owner.id);
  redirect(`/dashboard/categories/${category.id}`);
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, ownerId: owner.id },
  });
  if (!existing) redirect("/dashboard/categories");
  const { title, description } = readFields(formData);
  if (!title) redirect(`/dashboard/categories/${categoryId}?error=name`);

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      title,
      description,
      isActive: formData.get("isActive") === "on",
      showOnWebsite: formData.get("showOnWebsite") === "on",
      slug:
        title === existing.title
          ? existing.slug
          : await uniqueCategorySlug(owner.id, title, categoryId),
    },
  });
  await revalidateOwnerStores(owner.id);
  redirect(`/dashboard/categories/${categoryId}?saved=1`);
}

export async function deleteCategory(categoryId: string) {
  const { owner } = await requireOwnerWrite();
  await prisma.category.deleteMany({ where: { id: categoryId, ownerId: owner.id } });
  await revalidateOwnerStores(owner.id);
  redirect("/dashboard/categories");
}

export async function saveCategoryOrder(raw: string[]): Promise<OrderActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const ids = validOrderedIds(raw);
    if (!ids) return { error: "Invalid order." };
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.category.updateMany({
          where: { id, ownerId: owner.id },
          data: { sortOrder: index },
        }),
      ),
    );
    await revalidateOwnerStores(owner.id);
    return { ok: true };
  } catch (error) {
    console.error("saveCategoryOrder failed", error);
    return { error: "Could not save order." };
  }
}

export async function setShopLayout(standId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const layout = formData.get("shopLayout") === "CATEGORIES" ? "CATEGORIES" : "ALL_PRODUCTS";
  await prisma.stand.updateMany({
    where: { id: standId, ownerId: owner.id },
    data: { shopLayout: layout },
  });
  await revalidateOwnerStores(owner.id);
  redirect("/dashboard/categories?layout=saved");
}
