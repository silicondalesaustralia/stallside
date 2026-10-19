"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { parseBlogPostForm, publishBlockers } from "@/lib/blog/admin-form";
import { adminBlogPath, adminBlogPostPath } from "@/lib/blog/paths";
import { revalidateBlogPost } from "@/lib/blog/revalidate";
import { uniqueBlogSlug } from "@/lib/blog/slug";
import { defaultBlogAuthorId } from "@/lib/blog/authors";

function backTo(id: string, query: Record<string, string>): never {
  redirect(`${adminBlogPostPath(id)}?${new URLSearchParams(query)}`);
}

function postId(formData: FormData): string {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing post id");
  return id;
}

/** Save editor fields. Slugs are frozen once a post has been published. */
async function saveFromForm(id: string, formData: FormData) {
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw new Error("Post not found");
  let parsed: ReturnType<typeof parseBlogPostForm>;
  try {
    parsed = parseBlogPostForm(formData);
  } catch (error) {
    backTo(id, { error: error instanceof Error ? error.message : "Invalid form" });
  }
  const slug =
    existing.publishedAt || !parsed.slugInput || parsed.slugInput === existing.slug
      ? existing.slug
      : await uniqueBlogSlug(parsed.slugInput, id);
  const post = await prisma.blogPost.update({ where: { id }, data: { ...parsed.data, slug } });
  if (existing.status === "PUBLISHED") {
    revalidateBlogPost(existing.section, existing.slug, existing.alsoListedIn);
    revalidateBlogPost(post.section, post.slug, post.alsoListedIn);
  }
  return post;
}

export async function saveBlogPostAction(formData: FormData) {
  await requireAdmin();
  const id = postId(formData);
  await saveFromForm(id, formData);
  backTo(id, { saved: "1" });
}

async function goLive(formData: FormData, when: Date | null) {
  await requireAdmin();
  const id = postId(formData);
  const post = await saveFromForm(id, formData);
  const blockers = publishBlockers(post);
  if (!post.authorId) blockers.push("Choose an author");
  if (blockers.length) backTo(id, { error: blockers.join("; ") });

  const now = new Date();
  const alreadyLive = post.status === "PUBLISHED" && post.publishedAt && post.publishedAt <= now;
  const publishedAt = when ?? (alreadyLive ? post.publishedAt : now);
  await prisma.blogPost.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt,
      contentUpdatedAt: alreadyLive ? now : publishedAt,
      rejectionReason: null,
    },
  });
  revalidateBlogPost(post.section, post.slug, post.alsoListedIn);
  backTo(id, { saved: when ? "scheduled" : "published" });
}

export async function publishBlogPostAction(formData: FormData) {
  await goLive(formData, null);
}

export async function scheduleBlogPostAction(formData: FormData) {
  const raw = formData.get("scheduledFor");
  const when = typeof raw === "string" && raw ? new Date(raw) : null;
  if (!when || Number.isNaN(when.getTime()) || when <= new Date()) {
    backTo(postId(formData), { error: "Pick a future date and time to schedule" });
  }
  await goLive(formData, when);
}

export async function rejectBlogPostAction(formData: FormData) {
  await requireAdmin();
  const id = postId(formData);
  const reason = String(formData.get("rejectionReason") ?? "").trim();
  if (!reason) backTo(id, { error: "Add a reason so the agent can learn from it" });
  await prisma.blogPost.update({
    where: { id },
    data: { status: "REJECTED", rejectionReason: reason.slice(0, 2000) },
  });
  redirect(adminBlogPath("rejected"));
}

export async function unpublishBlogPostAction(formData: FormData) {
  await requireAdmin();
  const id = postId(formData);
  const post = await prisma.blogPost.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateBlogPost(post.section, post.slug, post.alsoListedIn);
  backTo(id, { saved: "archived" });
}

export async function createManualBlogDraftAction() {
  await requireAdmin();
  const post = await prisma.blogPost.create({
    data: {
      slug: await uniqueBlogSlug(`untitled-${Date.now()}`),
      title: "Untitled post",
      seoTitle: "",
      seoDescription: "",
      excerpt: "",
      bodyHtml: "",
      source: "MANUAL",
      authorId: await defaultBlogAuthorId(),
    },
    select: { id: true },
  });
  redirect(adminBlogPostPath(post.id));
}
