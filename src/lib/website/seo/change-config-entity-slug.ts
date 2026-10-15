import type { Prisma } from "@/generated/prisma/client";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { ensureCustomPages, findCustomPageById, mergeCustomPagesIntoRaw } from "@/lib/studio/custom-pages";
import {
  extractBlogPosts,
  extractBlogTopics,
  findBlogPostById,
  isValidBlogSlug,
  mergeBlogPostsIntoRaw,
  mergeBlogTopicsIntoRaw,
} from "@/lib/studio/blog";
import { blogPostRelativePath, withDefaultBlogTopic } from "@/lib/studio/blog-topics";
import { withRenameRedirect, withoutRedirectFrom } from "@/lib/studio/rename-redirects";
import { withLinksRetargeted } from "@/lib/studio/retarget-links";
import { siteSlugProblem, type SiteSlugKind } from "@/lib/storefront/site-slugs";
import { siteSlugOwnersFromConfig } from "@/lib/storefront/resolve-site-slug";
import { DRAFT_CONFLICT_MESSAGE, writeStorefrontDraft } from "@/lib/website/persistence/draft-store";
import { patchLiveConfig } from "@/lib/website/persistence/live-patch";
import { BLOG_TOPIC_PAGE_PREFIX } from "./entity-context";
import type { SlugChangeResult } from "./entity-context-types";

type Plan =
  | { error: string }
  | { config: Record<string, unknown>; from: string; to: string; livePostId?: string };

function withAddressChange(raw: unknown, from: string, to: string, redirectOld: boolean) {
  return redirectOld ? withRenameRedirect(raw, from, to) : withoutRedirectFrom(raw, to);
}

async function sitePlan(
  ownerId: string,
  raw: unknown,
  self: { kind: SiteSlugKind; id: string },
  slug: string,
  apply: () => Record<string, unknown>,
): Promise<Plan> {
  const problem = siteSlugProblem(slug, await siteSlugOwnersFromConfig(ownerId, raw), self);
  return problem ? { error: problem } : { config: apply(), from: "", to: `/${slug}` };
}

async function planChange(ownerId: string, raw: unknown, entityKey: string, slug: string): Promise<Plan | null> {
  if (entityKey.startsWith(`page:${BLOG_TOPIC_PAGE_PREFIX}`)) {
    const id = entityKey.slice(`page:${BLOG_TOPIC_PAGE_PREFIX}`.length);
    const topics = withDefaultBlogTopic(extractBlogTopics(raw));
    const topic = topics.find((t) => t.id === id);
    if (!topic) return { error: "This blog category no longer exists." };
    const plan = await sitePlan(ownerId, raw, { kind: "blogCategory", id }, slug, () =>
      mergeBlogTopicsIntoRaw(raw, topics.map((t) => (t.id === id ? { ...t, slug } : t))),
    );
    return "error" in plan ? plan : { ...plan, from: `/${topic.slug}` };
  }
  if (entityKey.startsWith("page:")) {
    const id = entityKey.slice(5);
    const pages = ensureCustomPages(raw);
    const page = findCustomPageById(pages, id);
    if (!page || page.routeKind !== "custom") return { error: "This page's address can't be changed." };
    const plan = await sitePlan(ownerId, raw, { kind: "page", id }, slug, () =>
      withLinksRetargeted(
        mergeCustomPagesIntoRaw(raw, pages.map((p) => (p.id === id ? { ...p, slug } : p))),
        "nav", "/", slug, [page.slug],
      ),
    );
    return "error" in plan ? plan : { ...plan, from: `/${page.slug}` };
  }
  if (entityKey.startsWith("blog:")) {
    const id = entityKey.slice(5);
    const posts = extractBlogPosts(raw);
    const post = findBlogPostById(posts, id);
    if (!post) return { error: "This blog post no longer exists." };
    if (!isValidBlogSlug(slug)) return { error: `"${slug}" is reserved. Choose another.` };
    const clash = posts.find((p) => p.id !== id && p.slug === slug);
    if (clash) return { error: `"${slug}" is already used by the blog post "${clash.title}". Choose another.` };
    const topics = extractBlogTopics(raw);
    return {
      config: mergeBlogPostsIntoRaw(raw, posts.map((p) => (p.id === id ? { ...p, slug } : p))),
      from: blogPostRelativePath(post, topics),
      to: blogPostRelativePath({ ...post, slug }, topics),
      livePostId: post.status === "published" ? id : undefined,
    };
  }
  return null;
}

/** Renames a live blog post in the published config so its new address works straight away. */
async function patchLivePost(ownerId: string, postId: string, slug: string, from: string, to: string, redirectOld: boolean) {
  await patchLiveConfig(ownerId, (live) => {
    const posts = extractBlogPosts(live).map((p) => (p.id === postId ? { ...p, slug } : p));
    return withAddressChange(mergeBlogPostsIntoRaw(live, posts), from, to, redirectOld) as Prisma.InputJsonValue;
  });
}

/** Changes the slug of a custom page, blog category or blog post in the draft, or null for other keys. */
export async function changeConfigEntitySlug(
  ownerId: string,
  businessName: string,
  entityKey: string,
  slug: string,
  redirectOld: boolean,
): Promise<SlugChangeResult | null> {
  const sf = await ensureStorefront(ownerId, businessName);
  const plan = await planChange(ownerId, sf.draftConfig, entityKey, slug);
  if (!plan) return null;
  if ("error" in plan) return { ok: false, message: plan.error };
  if (plan.from === plan.to) return { ok: true };
  const saved = await writeStorefrontDraft({
    ownerId,
    expectedRevision: sf.draftRevision,
    draftConfig: withAddressChange(plan.config, plan.from, plan.to, redirectOld) as Prisma.InputJsonValue,
  });
  if (!saved.ok) return { ok: false, message: DRAFT_CONFLICT_MESSAGE };
  if (plan.livePostId) await patchLivePost(ownerId, plan.livePostId, slug, plan.from, plan.to, redirectOld);
  return { ok: true };
}
