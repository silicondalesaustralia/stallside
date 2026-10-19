import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/legal";
import { getAllArticles } from "@/lib/farms-stand-news";
import { blogPostPath } from "./paths";

const REJECTION_LOOKBACK_DAYS = 60;

/** Everything the daily agent needs to pick an action without duplicating work. */
export async function loadBlogAgentContext() {
  const now = new Date();
  const since = new Date(now.getTime() - REJECTION_LOOKBACK_DAYS * 86_400_000);

  const [posts, pendingRevisions, topics, rejected, discarded, codeArticles] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: { in: ["DRAFT", "PUBLISHED"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        section: true,
        alsoListedIn: true,
        status: true,
        title: true,
        keywords: true,
        targetQueries: true,
        source: true,
        publishedAt: true,
        contentUpdatedAt: true,
        createdAt: true,
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true, status: true },
        },
      },
    }),
    prisma.blogPostRevision.findMany({
      where: { status: "PENDING" },
      select: { id: true, postId: true, createdAt: true },
    }),
    prisma.blogTopic.findMany({
      where: { status: { in: ["IDEA", "WAITING_FOR_RELEASE"] } },
      orderBy: [{ score: "desc" }, { createdAt: "asc" }],
      take: 200,
    }),
    prisma.blogPost.findMany({
      where: { status: "REJECTED", updatedAt: { gte: since } },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: { title: true, source: true, rejectionReason: true, updatedAt: true },
    }),
    prisma.blogPostRevision.findMany({
      where: { status: "DISCARDED", discardReason: { not: null }, resolvedAt: { gte: since } },
      orderBy: { resolvedAt: "desc" },
      take: 30,
      select: { postId: true, discardReason: true, changeNotes: true, resolvedAt: true },
    }),
    getAllArticles(),
  ]);

  return {
    generatedAt: now.toISOString(),
    siteUrl: SITE_URL,
    posts: posts.map(({ revisions, ...post }) => ({
      ...post,
      url: `${SITE_URL}${blogPostPath(post.section, post.slug)}`,
      lastRevisionAt: revisions[0]?.createdAt ?? null,
      scheduled: post.status === "PUBLISHED" && post.publishedAt !== null && post.publishedAt > now,
    })),
    /** Hand-coded articles: never revise these through the API. */
    codeArticles: codeArticles
      .filter((a) => !a.canonicalPath)
      .map((a) => ({ slug: a.slug, title: a.title, keywords: a.keywords ?? null })),
    pendingRevisions,
    topics,
    recentRejections: rejected,
    recentDiscardedRevisions: discarded,
  };
}
