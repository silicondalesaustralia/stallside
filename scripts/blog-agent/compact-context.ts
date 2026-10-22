import { parseTargetQueries } from "../../src/lib/blog/types";

type ContextPost = {
  id: string;
  slug: string;
  section: string;
  status: string;
  title: string;
  url: string;
  targetQueries: unknown;
  contentUpdatedAt: string | null;
  lastRevisionAt: string | null;
  scheduled: boolean;
};
type ContextTopic = { title: string; status: string; source: string; targetPostSlug: string | null; recommendedAt: string | null };

/** Shape of GET /context (only the fields the agents read). */
export type BlogContext = {
  siteUrl: string;
  posts: ContextPost[];
  codeArticles: Array<{ slug: string; title: string }>;
  pendingRevisions: Array<{ postId: string }>;
  topics: ContextTopic[];
  recentRejections: Array<{ title: string; source: string; rejectionReason: string | null }>;
  recentDiscardedRevisions: Array<{ postId: string; discardReason: string | null }>;
};

export function existingTitles(context: BlogContext): string[] {
  return [...context.posts, ...context.codeArticles].map((item) => item.title);
}

/** What the planner needs to avoid duplicates and pick updates, without ids, timestamps or full topic rows. */
export function plannerContext(context: BlogContext) {
  const pending = new Set(context.pendingRevisions.map((r) => r.postId));
  return {
    posts: context.posts.map((p) => ({
      slug: p.slug,
      section: p.section,
      status: p.scheduled ? "SCHEDULED" : p.status,
      title: p.title,
      queries: parseTargetQueries(p.targetQueries).map((q) => q.query),
      contentUpdatedAt: p.contentUpdatedAt?.slice(0, 10) ?? null,
      lastRevisionAt: p.lastRevisionAt?.slice(0, 10) ?? null,
      ...(pending.has(p.id) ? { pendingRevision: true } : {}),
    })),
    codeArticles: context.codeArticles.map((a) => ({ slug: a.slug, title: a.title })),
    backlog: context.topics.map((t) => ({
      title: t.title,
      status: t.status,
      source: t.source,
      ...(t.targetPostSlug ? { update: t.targetPostSlug } : {}),
    })),
    recentRejections: context.recentRejections.map((r) => ({ title: r.title, reason: r.rejectionReason })),
    recentDiscardedRevisionReasons: context.recentDiscardedRevisions.map((r) => r.discardReason).filter(Boolean),
  };
}

/** Pages the writer may link to: published posts and hand-coded articles. */
export function linkablePages(context: BlogContext) {
  const live = context.posts
    .filter((p) => p.status === "PUBLISHED" && !p.scheduled)
    .map((p) => ({ title: p.title, path: p.url.replace(context.siteUrl, "") }));
  const livePaths = new Set(live.map((p) => p.path));
  const code = context.codeArticles
    .map((a) => ({ title: a.title, path: `/farms-stand-news/${a.slug}` }))
    .filter((a) => !livePaths.has(a.path));
  return [...live, ...code];
}
