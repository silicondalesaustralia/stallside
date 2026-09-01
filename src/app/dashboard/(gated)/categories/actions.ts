"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

async function uniqueCategorySlug(
  ownerId: string,
  base: string,
  excludeId?: string,
) {
  const root = slugify(base) || "category";
  const exists = async (slug: string) =>
    Boolean(
      await prisma.category.findFirst({
        where: {
          ownerId,
          slug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      }),
    );
  if (!(await exists(root))) return root;
  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${root}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  throw new Error("Could not allocate category slug");
}

export async function createCategory(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  if (!title) redirect("/dashboard/categories?error=name");
  const description =
    String(formData.get("description") ?? "").trim().slice(0, 300) || null;
  const slug = await uniqueCategorySlug(owner.id, title);

  await prisma.category.create({
    data: {
      ownerId: owner.id,
      title,
      slug,
      description,
    },
  });
  revalidatePath("/dashboard/categories");
  redirect("/dashboard/categories");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, ownerId: owner.id },
  });
  if (!existing) redirect("/dashboard/categories");

  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  if (!title) redirect("/dashboard/categories?error=name");
  const description =
    String(formData.get("description") ?? "").trim().slice(0, 300) || null;
  const isActive = formData.get("isActive") === "on";

  let slug = existing.slug;
  if (title !== existing.title) {
    slug = await uniqueCategorySlug(owner.id, title, categoryId);
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { title, slug, description, isActive },
  });
  revalidatePath("/dashboard/categories");
  redirect("/dashboard/categories");
}

export async function deleteCategory(categoryId: string) {
  const { owner } = await requireOwnerWrite();
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, ownerId: owner.id },
    select: { id: true },
  });
  if (!existing) redirect("/dashboard/categories");
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/dashboard/categories");
  redirect("/dashboard/categories");
}
