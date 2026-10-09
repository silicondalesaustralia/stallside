"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { sanitizeSignHtml } from "@/lib/sanitize-sign-html";
import {
  extractBlogPosts,
  extractBlogTopics,
  mergeBlogPostsIntoRaw,
  mergeBlogTopicsIntoRaw,
  mergeBlogSettingsIntoRaw,
  ensureBlogSettings,
  findBlogPostById,
  findBlogTopicById,
  isValidBlogSlug,
  slugifyBlogSlug,
  newBlogPost,
  newBlogTopic,
  blogPostsNeedSync,
  type StorefrontBlogPost,
  type StorefrontBlogSettings,
} from "@/lib/studio/blog";
import {
  ensureCustomPages,
  mergeCustomPagesIntoRaw,
  customPagesNeedSync,
} from "@/lib/studio/custom-pages";

async function loadStorefront(ownerId: string, businessName: string) {
  return ensureStorefront(ownerId, businessName);
}

function parseTopicIds(formData: FormData): string[] {
  const raw = String(formData.get("topicIds") ?? "");
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function saveDraftPosts(ownerId: string, posts: StorefrontBlogPost[]) {
  const sf = await prisma.storefront.findUniqueOrThrow({ where: { ownerId } });
  const mergedDraft = mergeBlogPostsIntoRaw(sf.draftConfig, posts);
  await prisma.storefront.update({
    where: { ownerId },
    data: { draftConfig: mergedDraft as import("@/generated/prisma/client").Prisma.InputJsonValue },
  });
  return sf.slug;
}

async function syncPublishedPost(ownerId: string, post: StorefrontBlogPost) {
  const sf = await prisma.storefront.findUniqueOrThrow({ where: { ownerId } });
  if (!sf.publishedConfig || !sf.isPublished) return;
  const pubPosts = extractBlogPosts(sf.publishedConfig);
  const next =
    post.status === "published"
      ? pubPosts.some((p) => p.id === post.id)
        ? pubPosts.map((p) => (p.id === post.id ? post : p))
        : [...pubPosts, post]
      : pubPosts.filter((p) => p.id !== post.id);
  await prisma.storefront.update({
    where: { ownerId },
    data: {
      publishedConfig: mergeBlogPostsIntoRaw(sf.publishedConfig, next) as import("@/generated/prisma/client").Prisma.InputJsonValue,
    },
  });
}

export async function syncBlogDefaults() {
  const { owner } = await requireOwnerWrite();
  const sf = await loadStorefront(owner.id, owner.businessName);
  let draftConfig: import("@/generated/prisma/client").Prisma.InputJsonValue =
    sf.draftConfig as import("@/generated/prisma/client").Prisma.InputJsonValue;
  let changed = false;

  if (blogPostsNeedSync(draftConfig)) {
    draftConfig = mergeBlogSettingsIntoRaw(draftConfig, ensureBlogSettings(draftConfig)) as import("@/generated/prisma/client").Prisma.InputJsonValue;
    changed = true;
  }
  if (customPagesNeedSync(draftConfig)) {
    draftConfig = mergeCustomPagesIntoRaw(draftConfig, ensureCustomPages(draftConfig)) as import("@/generated/prisma/client").Prisma.InputJsonValue;
    changed = true;
  }

  if (changed) {
    await prisma.storefront.update({
      where: { ownerId: owner.id },
      data: { draftConfig: draftConfig as import("@/generated/prisma/client").Prisma.InputJsonValue },
    });
    revalidatePath("/dashboard/website/blog");
  }
}

export async function updateBlogSettings(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const sf = await loadStorefront(owner.id, owner.businessName);
  const settings: StorefrontBlogSettings = {
    enabled: formData.get("enabled") === "on",
    showInNav: formData.get("showInNav") === "on",
    navLabel: String(formData.get("navLabel") ?? "Blog").trim().slice(0, 40) || "Blog",
    indexTitle: String(formData.get("indexTitle") ?? "Blog").trim().slice(0, 80) || "Blog",
    navSortOrder: ensureBlogSettings(sf.draftConfig).navSortOrder,
  };
  await prisma.storefront.update({
    where: { ownerId: owner.id },
    data: {
      draftConfig: mergeBlogSettingsIntoRaw(sf.draftConfig, settings) as import("@/generated/prisma/client").Prisma.InputJsonValue,
    },
  });
  revalidatePath("/dashboard/website/blog");
  redirect("/dashboard/website/blog?saved=1");
}

export async function createBlogPost(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const sf = await loadStorefront(owner.id, owner.businessName);
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const slug = slugifyBlogSlug(String(formData.get("slug") ?? title));
  if (!title || !isValidBlogSlug(slug)) redirect("/dashboard/website/blog/new?error=slug");

  const posts = extractBlogPosts(sf.draftConfig);
  if (posts.some((p) => p.slug === slug)) redirect("/dashboard/website/blog/new?error=duplicate");

  const post = newBlogPost({ title, slug });
  await saveDraftPosts(owner.id, [...posts, post]);
  revalidatePath("/dashboard/website/blog");
  redirect(`/dashboard/website/blog/${post.id}?created=1`);
}

export async function updateBlogPost(postId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const sf = await loadStorefront(owner.id, owner.businessName);
  const posts = extractBlogPosts(sf.draftConfig);
  const post = findBlogPostById(posts, postId);
  if (!post) redirect("/dashboard/website/blog?error=missing");

  const title = String(formData.get("title") ?? post.title).trim().slice(0, 120);
  const slug = slugifyBlogSlug(String(formData.get("slug") ?? post.slug));
  const excerpt = String(formData.get("excerpt") ?? "").trim().slice(0, 320);
  const featuredImageUrl = String(formData.get("featuredImageUrl") ?? "").trim().slice(0, 500) || null;
  const bodyHtml = sanitizeSignHtml(String(formData.get("bodyHtml") ?? ""), false, 50000);
  const topicIds = parseTopicIds(formData);

  if (!title || !isValidBlogSlug(slug)) redirect(`/dashboard/website/blog/${postId}?error=slug`);
  if (posts.some((p) => p.id !== postId && p.slug === slug)) {
    redirect(`/dashboard/website/blog/${postId}?error=duplicate`);
  }

  const next: StorefrontBlogPost = {
    ...post,
    title,
    slug,
    excerpt,
    featuredImageUrl,
    bodyHtml,
    topicIds,
    updatedAt: new Date().toISOString(),
  };

  const slugPath = await saveDraftPosts(
    owner.id,
    posts.map((p) => (p.id === postId ? next : p)),
  );
  if (next.status === "published") await syncPublishedPost(owner.id, next);

  revalidatePath("/dashboard/website/blog");
  revalidatePath(`/dashboard/website/blog/${postId}`);
  revalidatePath(`${storefrontPublicPath(slugPath)}/blog`);
  redirect(`/dashboard/website/blog/${postId}?saved=1`);
}

export async function publishBlogPost(postId: string) {
  const { owner } = await requireOwnerWrite();
  const sf = await loadStorefront(owner.id, owner.businessName);
  const posts = extractBlogPosts(sf.draftConfig);
  const post = findBlogPostById(posts, postId);
  if (!post) redirect("/dashboard/website/blog?error=missing");

  const now = new Date().toISOString();
  const next: StorefrontBlogPost = {
    ...post,
    status: "published",
    publishedAt: post.publishedAt ?? now,
    updatedAt: now,
  };

  const slugPath = await saveDraftPosts(
    owner.id,
    posts.map((p) => (p.id === postId ? next : p)),
  );
  await syncPublishedPost(owner.id, next);

  revalidatePath("/dashboard/website/blog");
  revalidatePath(`${storefrontPublicPath(slugPath)}/blog`);
  redirect(`/dashboard/website/blog/${postId}?published=1`);
}

export async function unpublishBlogPost(postId: string) {
  const { owner } = await requireOwnerWrite();
  const sf = await loadStorefront(owner.id, owner.businessName);
  const posts = extractBlogPosts(sf.draftConfig);
  const post = findBlogPostById(posts, postId);
  if (!post) redirect("/dashboard/website/blog?error=missing");

  const next: StorefrontBlogPost = {
    ...post,
    status: "draft",
    updatedAt: new Date().toISOString(),
  };

  const slugPath = await saveDraftPosts(
    owner.id,
    posts.map((p) => (p.id === postId ? next : p)),
  );
  await syncPublishedPost(owner.id, next);

  revalidatePath("/dashboard/website/blog");
  revalidatePath(`${storefrontPublicPath(slugPath)}/blog`);
  redirect(`/dashboard/website/blog/${postId}?unpublished=1`);
}

export async function deleteBlogPost(postId: string) {
  const { owner } = await requireOwnerWrite();
  const sf = await loadStorefront(owner.id, owner.businessName);
  const posts = extractBlogPosts(sf.draftConfig);
  const post = findBlogPostById(posts, postId);
  if (!post) redirect("/dashboard/website/blog?error=missing");

  const slugPath = await saveDraftPosts(
    owner.id,
    posts.filter((p) => p.id !== postId),
  );
  await syncPublishedPost(owner.id, { ...post, status: "draft" });

  revalidatePath("/dashboard/website/blog");
  revalidatePath(`${storefrontPublicPath(slugPath)}/blog`);
  redirect("/dashboard/website/blog?deleted=1");
}

export async function createBlogTopic(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const sf = await loadStorefront(owner.id, owner.businessName);
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  if (!name) redirect("/dashboard/website/blog/topics?error=name");

  const topics = extractBlogTopics(sf.draftConfig);
  const slug = slugifyBlogSlug(name);
  if (topics.some((t) => t.slug === slug)) redirect("/dashboard/website/blog/topics?error=duplicate");

  const merged = mergeBlogTopicsIntoRaw(sf.draftConfig, [...topics, newBlogTopic(name)]);
  await prisma.storefront.update({
    where: { ownerId: owner.id },
    data: { draftConfig: merged as import("@/generated/prisma/client").Prisma.InputJsonValue },
  });
  revalidatePath("/dashboard/website/blog/topics");
  redirect("/dashboard/website/blog/topics?saved=1");
}

export async function deleteBlogTopic(topicId: string) {
  const { owner } = await requireOwnerWrite();
  const sf = await loadStorefront(owner.id, owner.businessName);
  const topics = extractBlogTopics(sf.draftConfig);
  if (!findBlogTopicById(topics, topicId)) redirect("/dashboard/website/blog/topics?error=missing");

  const nextTopics = topics.filter((t) => t.id !== topicId);
  const posts = extractBlogPosts(sf.draftConfig).map((p) => ({
    ...p,
    topicIds: p.topicIds.filter((id) => id !== topicId),
  }));

  let merged = mergeBlogTopicsIntoRaw(sf.draftConfig, nextTopics);
  merged = mergeBlogPostsIntoRaw(merged, posts);
  await prisma.storefront.update({
    where: { ownerId: owner.id },
    data: { draftConfig: merged as import("@/generated/prisma/client").Prisma.InputJsonValue },
  });
  revalidatePath("/dashboard/website/blog/topics");
  redirect("/dashboard/website/blog/topics?deleted=1");
}
