"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { patchLiveConfig } from "@/lib/website/persistence/live-patch";
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
  isValidBlogSlug,
  slugifyBlogSlug,
  newBlogPost,
  blogPostsNeedSync,
  type StorefrontBlogPost,
  type StorefrontBlogSettings,
  type StorefrontBlogTopic,
} from "@/lib/studio/blog";
import { blogPostRelativePath, withDefaultBlogTopic } from "@/lib/studio/blog-topics";
import { withRenameRedirect } from "@/lib/studio/rename-redirects";
import {
  ensureCustomPages,
  mergeCustomPagesIntoRaw,
  customPagesNeedSync,
  BLOG_INDEX_BUILTIN_ID,
} from "@/lib/studio/custom-pages";
import type { Prisma } from "@/generated/prisma/client";
import { writeStorefrontDraft } from "@/lib/website/persistence/draft-store";
import { writeDraftOrRedirect } from "@/lib/website/persistence/draft-redirect";

const BLOG_PATH = "/dashboard/website/blog";
const BLOG_SETTINGS_PATH = `/dashboard/website/pages/${BLOG_INDEX_BUILTIN_ID}`;

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

type LoadedStorefront = Awaited<ReturnType<typeof loadStorefront>>;

async function saveDraftPosts(
  sf: LoadedStorefront,
  posts: StorefrontBlogPost[],
  conflictPath = BLOG_PATH,
  rename?: { from: string; to: string },
) {
  const merged = mergeBlogPostsIntoRaw(sf.draftConfig, posts);
  await writeDraftOrRedirect({
    ownerId: sf.ownerId,
    expectedRevision: sf.draftRevision,
    draftConfig: (rename ? withRenameRedirect(merged, rename.from, rename.to) : merged) as Prisma.InputJsonValue,
    conflictPath,
  });
  return sf.slug;
}

/**
 * Blog posts publish individually; this updates only that post on the live site, plus the
 * blog categories it uses (its URL is `/{main category}/{post}`).
 */
async function syncPublishedPost(ownerId: string, post: StorefrontBlogPost, draftTopics: StorefrontBlogTopic[] = []) {
  await patchLiveConfig(ownerId, (publishedConfig) => {
    const pubPosts = extractBlogPosts(publishedConfig);
    const pubTopics = extractBlogTopics(publishedConfig);
    const used = draftTopics.filter((t) => post.topicIds.includes(t.id));
    const topics = [...pubTopics.map((t) => used.find((u) => u.id === t.id) ?? t), ...used.filter((u) => !pubTopics.some((t) => t.id === u.id))];
    const next =
      post.status === "published"
        ? pubPosts.some((p) => p.id === post.id)
          ? pubPosts.map((p) => (p.id === post.id ? post : p))
          : [...pubPosts, post]
        : pubPosts.filter((p) => p.id !== post.id);
    const withTopics = post.status === "published" ? mergeBlogTopicsIntoRaw(publishedConfig, topics) : publishedConfig;
    return mergeBlogPostsIntoRaw(withTopics, next) as Prisma.InputJsonValue;
  });
}

export async function syncBlogDefaults() {
  const { owner } = await requireWebsiteOwner();
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
    const saved = await writeStorefrontDraft({
      ownerId: owner.id,
      expectedRevision: sf.draftRevision,
      draftConfig,
    });
    // Another write got in first; the next page load retries the sync.
    if (saved.ok) revalidatePath("/dashboard/website/blog");
  }
}

export async function updateBlogSettings(formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const sf = await loadStorefront(owner.id, owner.businessName);
  const settings: StorefrontBlogSettings = {
    enabled: formData.get("enabled") === "on",
    showInNav: formData.get("showInNav") === "on",
    navLabel: String(formData.get("navLabel") ?? "Blog").trim().slice(0, 40) || "Blog",
    indexTitle: String(formData.get("indexTitle") ?? "Blog").trim().slice(0, 80) || "Blog",
    navSortOrder: ensureBlogSettings(sf.draftConfig).navSortOrder,
  };
  await writeDraftOrRedirect({
    ownerId: owner.id,
    expectedRevision: sf.draftRevision,
    draftConfig: mergeBlogSettingsIntoRaw(sf.draftConfig, settings) as Prisma.InputJsonValue,
    conflictPath: BLOG_SETTINGS_PATH,
  });
  revalidatePath(BLOG_SETTINGS_PATH);
  redirect(`${BLOG_SETTINGS_PATH}?saved=1`);
}

export async function createBlogPost(formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const sf = await loadStorefront(owner.id, owner.businessName);
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const slug = slugifyBlogSlug(String(formData.get("slug") ?? title));
  if (!title || !isValidBlogSlug(slug)) redirect("/dashboard/website/blog/new?error=slug");

  const posts = extractBlogPosts(sf.draftConfig);
  if (posts.some((p) => p.slug === slug)) redirect("/dashboard/website/blog/new?error=duplicate");

  const post = newBlogPost({ title, slug });
  await saveDraftPosts(sf, [...posts, post], "/dashboard/website/blog/new");
  revalidatePath("/dashboard/website/blog");
  redirect(`/dashboard/website/blog/${post.id}?created=1`);
}

export async function updateBlogPost(postId: string, formData: FormData) {
  const { owner } = await requireWebsiteOwner();
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
  const mainRaw = String(formData.get("mainTopicId") ?? "");
  const known = withDefaultBlogTopic(extractBlogTopics(sf.draftConfig));
  const mainTopicId = known.some((t) => t.id === mainRaw) ? mainRaw : null;
  if (mainTopicId && !topicIds.includes(mainTopicId)) topicIds.unshift(mainTopicId);

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
    mainTopicId,
    updatedAt: new Date().toISOString(),
  };

  const fromPath = blogPostRelativePath(post, known);
  const toPath = blogPostRelativePath(next, known);
  const rename = post.slug !== next.slug ? { from: fromPath, to: toPath } : undefined;
  const slugPath = await saveDraftPosts(
    sf,
    posts.map((p) => (p.id === postId ? next : p)),
    `${BLOG_PATH}/${postId}`,
    rename,
  );
  if (next.status === "published") {
    await syncPublishedPost(owner.id, next, extractBlogTopics(sf.draftConfig));
    if (rename) {
      await patchLiveConfig(owner.id, (live) => withRenameRedirect(live, rename.from, rename.to) as Prisma.InputJsonValue);
    }
  }

  revalidatePath("/dashboard/website/blog");
  revalidatePath(`/dashboard/website/blog/${postId}`);
  revalidatePath(`${storefrontPublicPath(slugPath)}/blog`);
  redirect(`/dashboard/website/blog/${postId}?saved=1`);
}

export async function publishBlogPost(postId: string) {
  const { owner } = await requireWebsiteOwner();
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
    sf,
    posts.map((p) => (p.id === postId ? next : p)),
    `${BLOG_PATH}/${postId}`,
  );
  await syncPublishedPost(owner.id, next, extractBlogTopics(sf.draftConfig));

  revalidatePath("/dashboard/website/blog");
  revalidatePath(`${storefrontPublicPath(slugPath)}/blog`);
  redirect(`/dashboard/website/blog/${postId}?published=1`);
}

export async function unpublishBlogPost(postId: string) {
  const { owner } = await requireWebsiteOwner();
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
    sf,
    posts.map((p) => (p.id === postId ? next : p)),
    `${BLOG_PATH}/${postId}`,
  );
  await syncPublishedPost(owner.id, next);

  revalidatePath("/dashboard/website/blog");
  revalidatePath(`${storefrontPublicPath(slugPath)}/blog`);
  redirect(`/dashboard/website/blog/${postId}?unpublished=1`);
}

export async function deleteBlogPost(postId: string) {
  const { owner } = await requireWebsiteOwner();
  const sf = await loadStorefront(owner.id, owner.businessName);
  const posts = extractBlogPosts(sf.draftConfig);
  const post = findBlogPostById(posts, postId);
  if (!post) redirect("/dashboard/website/blog?error=missing");

  const slugPath = await saveDraftPosts(
    sf,
    posts.filter((p) => p.id !== postId),
  );
  await syncPublishedPost(owner.id, { ...post, status: "draft" });

  revalidatePath("/dashboard/website/blog");
  revalidatePath(`${storefrontPublicPath(slugPath)}/blog`);
  redirect("/dashboard/website/blog?deleted=1");
}
