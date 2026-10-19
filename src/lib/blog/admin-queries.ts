import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const ADMIN_BLOG_TABS = [
  { id: "drafts", label: "Drafts" },
  { id: "revisions", label: "Updates to review" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
  { id: "topics", label: "Topic backlog" },
  { id: "rejected", label: "Rejected & archived" },
] as const;

export type AdminBlogTab = (typeof ADMIN_BLOG_TABS)[number]["id"];

export function parseAdminBlogTab(value: string | undefined): AdminBlogTab {
  return ADMIN_BLOG_TABS.some((t) => t.id === value) ? (value as AdminBlogTab) : "drafts";
}

function postWhere(tab: AdminBlogTab, now: Date): Prisma.BlogPostWhereInput {
  switch (tab) {
    case "scheduled":
      return { status: "PUBLISHED", publishedAt: { gt: now } };
    case "published":
      return { status: "PUBLISHED", publishedAt: { lte: now } };
    case "rejected":
      return { status: { in: ["REJECTED", "ARCHIVED"] } };
    default:
      return { status: "DRAFT" };
  }
}

export async function loadAdminBlogCounts(now: Date): Promise<Record<AdminBlogTab, number>> {
  const [drafts, revisions, scheduled, published, topics, rejected] = await Promise.all([
    prisma.blogPost.count({ where: postWhere("drafts", now) }),
    prisma.blogPostRevision.count({ where: { status: "PENDING" } }),
    prisma.blogPost.count({ where: postWhere("scheduled", now) }),
    prisma.blogPost.count({ where: postWhere("published", now) }),
    prisma.blogTopic.count({ where: { status: { in: ["IDEA", "WAITING_FOR_RELEASE"] } } }),
    prisma.blogPost.count({ where: postWhere("rejected", now) }),
  ]);
  return { drafts, revisions, scheduled, published, topics, rejected };
}

export function loadAdminBlogPosts(tab: AdminBlogTab, now: Date) {
  return prisma.blogPost.findMany({
    where: postWhere(tab, now),
    orderBy: [{ timeSensitive: "desc" }, { updatedAt: "desc" }],
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      section: true,
      source: true,
      status: true,
      timeSensitive: true,
      agentSummary: true,
      rejectionReason: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export type AdminBlogPostRow = Awaited<ReturnType<typeof loadAdminBlogPosts>>[number];

export function loadAdminBlogRevisions() {
  return prisma.blogPostRevision.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { post: { select: { title: true, slug: true, section: true } } },
  });
}

export type AdminBlogRevisionRow = Awaited<ReturnType<typeof loadAdminBlogRevisions>>[number];

export function loadAdminBlogTopics() {
  return prisma.blogTopic.findMany({
    where: { status: { in: ["SELECTED", "IDEA", "WAITING_FOR_RELEASE"] } },
    orderBy: [{ selectedAt: { sort: "desc", nulls: "last" } }, { score: "desc" }, { createdAt: "desc" }],
    take: 200,
  });
}

export type AdminBlogTopicRow = Awaited<ReturnType<typeof loadAdminBlogTopics>>[number];
