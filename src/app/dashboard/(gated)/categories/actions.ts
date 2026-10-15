"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
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
} from "@/lib/categories/category-admin";
import { readCategoryFields } from "@/lib/categories/category-fields";

export async function createCategory(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const { title, description } = readCategoryFields(formData);
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
  await clearSiteRedirectFrom(owner.id, `/${category.slug}`);
  await revalidateOwnerStores(owner.id);
  redirect(`/dashboard/categories/${category.id}`);
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, ownerId: owner.id },
  });
  if (!existing) redirect("/dashboard/categories");
  const { title, description, bottomDescription, imageUrl } = readCategoryFields(formData);
  if (!title) redirect(`/dashboard/categories/${categoryId}?error=name`);

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      title,
      description,
      bottomDescription,
      imageUrl,
      showOnWebsite: formData.get("showOnWebsite") === "on",
      slug:
        title === existing.title || !isAutoCategorySlug(existing.slug, existing.title)
          ? existing.slug
          : await uniqueCategorySlug(owner.id, title, categoryId),
    },
    select: { slug: true },
  });
  if (updated.slug !== existing.slug) {
    await addSiteRenameRedirect(owner.id, `/${existing.slug}`, `/${updated.slug}`);
    await retargetSiteLinks(owner.id, "category", "/", updated.slug, [existing.slug]);
  }
  await revalidateOwnerStores(owner.id);
  redirect(`/dashboard/categories/${categoryId}?saved=1`);
}

/** Publish or unpublish a category everywhere it shows (shop, website, QR codes). `back: "list"` returns to the Categories list. */
export async function setCategoryActive(categoryId: string, isActive: boolean, back: "page" | "list" = "page") {
  const { owner } = await requireOwnerWrite();
  const updated = await prisma.category.updateMany({
    where: { id: categoryId, ownerId: owner.id },
    data: { isActive },
  });
  if (updated.count === 0) redirect("/dashboard/categories");
  await revalidateOwnerStores(owner.id);
  const done = `${isActive ? "published" : "unpublished"}=1`;
  redirect(back === "list" ? `/dashboard/categories?${done}` : `/dashboard/categories/${categoryId}?${done}`);
}

export async function deleteCategory(categoryId: string) {
  const { owner } = await requireOwnerWrite();
  await prisma.category.deleteMany({ where: { id: categoryId, ownerId: owner.id } });
  await revalidateOwnerStores(owner.id);
  redirect("/dashboard/categories?deleted=1");
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