import { randomUUID } from "crypto";
import { slugifyPageSlug, isValidPageSlug, RESERVED_PAGE_SLUGS, BLOG_INDEX_BUILTIN_ID } from "./custom-pages";

export { BLOG_INDEX_BUILTIN_ID };

export type BlogPostStatus = "draft" | "published";

export type StorefrontBlogTopic = {
  id: string;
  slug: string;
  name: string;
};

export type StorefrontBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  featuredImageUrl: string | null;
  topicIds: string[];
  status: BlogPostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StorefrontBlogSettings = {
  enabled: boolean;
  showInNav: boolean;
  /** Optional journal link in the Visit & Learn footer column. */
  showInFooter?: boolean;
  navLabel: string;
  indexTitle: string;
  navSortOrder: number;
};

export function defaultBlogSettings(): StorefrontBlogSettings {
  return {
    enabled: true,
    showInNav: false,
    showInFooter: false,
    navLabel: "Blog",
    indexTitle: "Blog",
    navSortOrder: 25,
  };
}

function isBlogTopic(raw: unknown): raw is StorefrontBlogTopic {
  if (!raw || typeof raw !== "object") return false;
  const t = raw as Partial<StorefrontBlogTopic>;
  return typeof t.id === "string" && typeof t.slug === "string" && typeof t.name === "string";
}

function isBlogPost(raw: unknown): raw is StorefrontBlogPost {
  if (!raw || typeof raw !== "object") return false;
  const p = raw as Partial<StorefrontBlogPost>;
  return (
    typeof p.id === "string" &&
    typeof p.slug === "string" &&
    typeof p.title === "string" &&
    typeof p.excerpt === "string" &&
    typeof p.bodyHtml === "string" &&
    (p.featuredImageUrl === null || typeof p.featuredImageUrl === "string") &&
    Array.isArray(p.topicIds) &&
    (p.status === "draft" || p.status === "published") &&
    (p.publishedAt === null || typeof p.publishedAt === "string") &&
    typeof p.createdAt === "string" &&
    typeof p.updatedAt === "string"
  );
}

export function extractBlogSettings(raw: unknown): StorefrontBlogSettings | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const s = (raw as { blogSettings?: unknown }).blogSettings;
  if (!s || typeof s !== "object") return undefined;
  const obj = s as Partial<StorefrontBlogSettings>;
  if (typeof obj.enabled !== "boolean") return undefined;
  return {
    enabled: obj.enabled,
    showInNav: obj.showInNav ?? false,
    showInFooter: obj.showInFooter ?? false,
    navLabel: obj.navLabel?.slice(0, 40) ?? "Blog",
    indexTitle: obj.indexTitle?.slice(0, 80) ?? "Blog",
    navSortOrder: typeof obj.navSortOrder === "number" ? obj.navSortOrder : 25,
  };
}

export function ensureBlogSettings(raw: unknown): StorefrontBlogSettings {
  return extractBlogSettings(raw) ?? defaultBlogSettings();
}

export function extractBlogTopics(raw: unknown): StorefrontBlogTopic[] {
  if (!raw || typeof raw !== "object") return [];
  const list = (raw as { blogTopics?: unknown }).blogTopics;
  if (!Array.isArray(list)) return [];
  return list.filter(isBlogTopic);
}

export function extractBlogPosts(raw: unknown): StorefrontBlogPost[] {
  if (!raw || typeof raw !== "object") return [];
  const list = (raw as { blogPosts?: unknown }).blogPosts;
  if (!Array.isArray(list)) return [];
  return list.filter(isBlogPost);
}

function mergeRawBase(existingRaw: unknown): Record<string, unknown> {
  return existingRaw && typeof existingRaw === "object" && !Array.isArray(existingRaw)
    ? { ...(existingRaw as Record<string, unknown>) }
    : {};
}

export function mergeBlogSettingsIntoRaw(
  existingRaw: unknown,
  settings: StorefrontBlogSettings,
): Record<string, unknown> {
  return { ...mergeRawBase(existingRaw), blogSettings: settings };
}

export function mergeBlogTopicsIntoRaw(
  existingRaw: unknown,
  topics: StorefrontBlogTopic[],
): Record<string, unknown> {
  return { ...mergeRawBase(existingRaw), blogTopics: topics };
}

export function mergeBlogPostsIntoRaw(
  existingRaw: unknown,
  posts: StorefrontBlogPost[],
): Record<string, unknown> {
  return { ...mergeRawBase(existingRaw), blogPosts: posts };
}

export function findBlogPostById(
  posts: StorefrontBlogPost[],
  id: string,
): StorefrontBlogPost | undefined {
  return posts.find((p) => p.id === id);
}

export function findBlogPostBySlug(
  posts: StorefrontBlogPost[],
  slug: string,
): StorefrontBlogPost | undefined {
  const key = slug.trim().toLowerCase();
  return posts.find((p) => p.slug === key);
}

export function findBlogTopicById(
  topics: StorefrontBlogTopic[],
  id: string,
): StorefrontBlogTopic | undefined {
  return topics.find((t) => t.id === id);
}

export function slugifyBlogSlug(input: string): string {
  return slugifyPageSlug(input);
}

export function isValidBlogSlug(slug: string): boolean {
  if (!slug || slug.length < 1) return false;
  if (slug === "blog") return false;
  if (RESERVED_PAGE_SLUGS.has(slug)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function listVisibleBlogPosts(
  posts: StorefrontBlogPost[],
  draft?: boolean,
): StorefrontBlogPost[] {
  const filtered = draft
    ? posts.filter((p) => p.status === "published" || p.status === "draft")
    : posts.filter((p) => p.status === "published");
  return filtered.sort((a, b) => {
    const aTime = a.publishedAt ?? a.updatedAt;
    const bTime = b.publishedAt ?? b.updatedAt;
    return bTime.localeCompare(aTime);
  });
}

export function blogPostsNeedSync(raw: unknown): boolean {
  return extractBlogSettings(raw) === undefined;
}

export function newBlogPost(input: {
  title: string;
  slug: string;
  excerpt?: string;
}): StorefrontBlogPost {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt ?? "",
    bodyHtml: "",
    featuredImageUrl: null,
    topicIds: [],
    status: "draft",
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function newBlogTopic(name: string): StorefrontBlogTopic {
  const slug = slugifyBlogSlug(name);
  return { id: randomUUID(), slug, name: name.trim().slice(0, 60) };
}

export function topicsForPost(
  topics: StorefrontBlogTopic[],
  post: StorefrontBlogPost,
): StorefrontBlogTopic[] {
  const ids = new Set(post.topicIds);
  return topics.filter((t) => ids.has(t.id));
}

export function formatBlogDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}
