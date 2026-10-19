"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import type { OrderActionResult } from "@/lib/categories/category-admin";
import { readCategoryFields } from "@/lib/categories/category-fields";
import {
  createOwnerCategory,
  deleteOwnerCategory,
  saveOwnerCategoryOrder,
  setOwnerCategoryActive,
  updateOwnerCategory,
} from "@/lib/categories/manage";

export async function createCategory(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const { title, description } = readCategoryFields(formData);
  const result = await createOwnerCategory(owner.id, title, description);
  if ("error" in result) redirect("/dashboard/categories?error=name");
  redirect(`/dashboard/categories/${result.id}`);
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const { title, description, bottomDescription, imageUrl } = readCategoryFields(formData);
  if (!title) redirect(`/dashboard/categories/${categoryId}?error=name`);
  const result = await updateOwnerCategory(owner.id, categoryId, {
    title,
    description,
    bottomDescription,
    imageUrl,
    showOnWebsite: formData.get("showOnWebsite") === "on",
  });
  if ("error" in result) redirect("/dashboard/categories");
  redirect(`/dashboard/categories/${categoryId}?saved=1`);
}

/** Publish or unpublish a category everywhere it shows (shop, website, QR codes). `back: "list"` returns to the Categories list. */
export async function setCategoryActive(categoryId: string, isActive: boolean, back: "page" | "list" = "page") {
  const { owner } = await requireOwnerWrite();
  const result = await setOwnerCategoryActive(owner.id, categoryId, isActive);
  if ("error" in result) redirect("/dashboard/categories");
  const done = `${isActive ? "published" : "unpublished"}=1`;
  redirect(back === "list" ? `/dashboard/categories?${done}` : `/dashboard/categories/${categoryId}?${done}`);
}

export async function deleteCategory(categoryId: string) {
  const { owner } = await requireOwnerWrite();
  await deleteOwnerCategory(owner.id, categoryId);
  redirect("/dashboard/categories?deleted=1");
}

export async function saveCategoryOrder(raw: string[]): Promise<OrderActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    return await saveOwnerCategoryOrder(owner.id, raw);
  } catch (error) {
    console.error("saveCategoryOrder failed", error);
    return { error: "Could not save order." };
  }
}
