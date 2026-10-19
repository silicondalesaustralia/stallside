"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { uploadAuthorAvatar } from "@/lib/blog/author-avatar-upload";
import { parseBlogAuthorForm } from "@/lib/blog/author-form";
import { adminBlogAuthorPath } from "@/lib/blog/paths";
import { revalidateBlogAuthor } from "@/lib/blog/revalidate";

function backTo(id: string, query: Record<string, string>): never {
  redirect(`${adminBlogAuthorPath(id)}?${new URLSearchParams(query)}`);
}

export async function createBlogAuthorAction() {
  await requireAdmin();
  const author = await prisma.blogAuthor.create({
    data: {
      slug: `new-author-${Date.now()}`,
      name: "New author",
      jobTitle: "",
      shortBio: "",
      bio: "",
      active: false,
    },
    select: { id: true },
  });
  redirect(adminBlogAuthorPath(author.id));
}

async function avatarFromUpload(id: string, formData: FormData): Promise<string | undefined> {
  const file = formData.get("avatarFile");
  if (!(file instanceof File) || file.size === 0) return undefined;
  return uploadAuthorAvatar(id, file);
}

export async function saveBlogAuthorAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.blogAuthor.findUnique({ where: { id } });
  if (!existing) throw new Error("Author not found");

  let parsed: ReturnType<typeof parseBlogAuthorForm>;
  let uploadedAvatar: string | undefined;
  try {
    parsed = parseBlogAuthorForm(formData);
    uploadedAvatar = await avatarFromUpload(id, formData);
  } catch (error) {
    backTo(id, { error: error instanceof Error ? error.message : "Could not save author" });
  }
  if (!parsed.slug) backTo(id, { error: "Slug is required" });
  const clash = await prisma.blogAuthor.findFirst({
    where: { slug: parsed.slug, id: { not: id } },
    select: { id: true },
  });
  if (clash) backTo(id, { error: `Another author already uses /authors/${parsed.slug}` });

  const data = { ...parsed.data, slug: parsed.slug, avatarUrl: uploadedAvatar ?? parsed.data.avatarUrl };
  await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.blogAuthor.updateMany({ where: { isDefault: true, id: { not: id } }, data: { isDefault: false } });
    }
    await tx.blogAuthor.update({ where: { id }, data });
  });
  revalidateBlogAuthor(existing.slug, data.slug);
  backTo(id, { saved: "1" });
}
