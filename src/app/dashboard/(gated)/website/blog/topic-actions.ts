"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import {
  extractBlogPosts,
  extractBlogTopics,
  mergeBlogPostsIntoRaw,
  mergeBlogTopicsIntoRaw,
  newBlogTopic,
  slugifyBlogSlug,
  type StorefrontBlogTopic,
} from "@/lib/studio/blog";
import { DEFAULT_BLOG_TOPIC, withDefaultBlogTopic } from "@/lib/studio/blog-topics";
import { siteSlugOwnersFromConfig } from "@/lib/storefront/resolve-site-slug";
import { siteSlugProblem } from "@/lib/storefront/site-slugs";
import { withRenameRedirect, withoutRedirectFrom } from "@/lib/studio/rename-redirects";
import type { Prisma } from "@/generated/prisma/client";
import { writeDraftOrRedirect } from "@/lib/website/persistence/draft-redirect";

const TOPICS_PATH = "/dashboard/website/blog/topics";

function fail(message: string): never {
  redirect(`${TOPICS_PATH}?error=slug&msg=${encodeURIComponent(message)}`);
}

async function load() {
  const { owner } = await requireWebsiteOwner();
  const sf = await ensureStorefront(owner.id, owner.businessName);
  return { owner, sf, topics: withDefaultBlogTopic(extractBlogTopics(sf.draftConfig)) };
}

async function save(ownerId: string, revision: number, draftConfig: unknown) {
  await writeDraftOrRedirect({
    ownerId,
    expectedRevision: revision,
    draftConfig: draftConfig as Prisma.InputJsonValue,
    conflictPath: TOPICS_PATH,
  });
  revalidatePath(TOPICS_PATH);
}

/** Blog categories share `/{slug}` with pages and product categories, so slugs must be unique across all three. */
export async function createBlogTopic(formData: FormData) {
  const { owner, sf, topics } = await load();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  if (!name) fail("Enter a name for the blog category.");
  const topic = newBlogTopic(name);
  const problem = siteSlugProblem(topic.slug, await siteSlugOwnersFromConfig(owner.id, sf.draftConfig));
  if (problem) fail(problem);
  const config = withoutRedirectFrom(mergeBlogTopicsIntoRaw(sf.draftConfig, [...topics, topic]), `/${topic.slug}`);
  await save(owner.id, sf.draftRevision, config);
  redirect(`${TOPICS_PATH}?saved=1`);
}

export async function renameBlogTopic(topicId: string, formData: FormData) {
  const { owner, sf, topics } = await load();
  const current = topics.find((t) => t.id === topicId);
  if (!current) redirect(`${TOPICS_PATH}?error=missing`);
  const name = String(formData.get("name") ?? current.name).trim().slice(0, 60) || current.name;
  const slug = slugifyBlogSlug(String(formData.get("slug") ?? "") || name);
  const owners = await siteSlugOwnersFromConfig(owner.id, sf.draftConfig);
  const problem = siteSlugProblem(slug, owners, { kind: "blogCategory", id: topicId });
  if (problem) fail(problem);
  const next: StorefrontBlogTopic[] = topics.map((t) => (t.id === topicId ? { ...t, name, slug } : t));
  let config: unknown = mergeBlogTopicsIntoRaw(sf.draftConfig, next);
  if (slug !== current.slug) config = withRenameRedirect(config, `/${current.slug}`, `/${slug}`);
  await save(owner.id, sf.draftRevision, config);
  redirect(`${TOPICS_PATH}?saved=1`);
}

export async function deleteBlogTopic(topicId: string) {
  const { owner, sf, topics } = await load();
  if (topicId === DEFAULT_BLOG_TOPIC.id) fail("The default blog category can't be removed. Rename it instead.");
  if (!topics.some((t) => t.id === topicId)) redirect(`${TOPICS_PATH}?error=missing`);
  const posts = extractBlogPosts(sf.draftConfig).map((p) => ({
    ...p,
    topicIds: p.topicIds.filter((id) => id !== topicId),
    mainTopicId: p.mainTopicId === topicId ? null : p.mainTopicId,
  }));
  const config = mergeBlogPostsIntoRaw(
    mergeBlogTopicsIntoRaw(sf.draftConfig, topics.filter((t) => t.id !== topicId)),
    posts,
  );
  await save(owner.id, sf.draftRevision, config);
  redirect(`${TOPICS_PATH}?deleted=1`);
}
