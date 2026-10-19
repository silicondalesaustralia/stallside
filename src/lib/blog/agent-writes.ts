import { prisma } from "@/lib/prisma";
import type { CreateDraftInput, CreateRevisionInput, TopicsBatchInput } from "./agent-schemas";
import { sanitizeBlogHtml } from "./sanitize-blog-html";
import { uniqueBlogSlug } from "./slug";

export class BlogAgentError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function createBlogDraft(input: CreateDraftInput) {
  const slug = await uniqueBlogSlug(input.slug || input.title);
  const post = await prisma.blogPost.create({
    data: {
      slug,
      section: input.section,
      alsoListedIn: input.alsoListedIn ?? null,
      status: "DRAFT",
      title: input.title,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      excerpt: input.excerpt,
      bodyHtml: sanitizeBlogHtml(input.bodyHtml),
      faqs: input.faqs,
      keywords: input.keywords,
      heroImageUrl: input.heroImage?.url,
      heroImageAlt: input.heroImage?.alt,
      heroImageWidth: input.heroImage?.width,
      heroImageHeight: input.heroImage?.height,
      source: input.source,
      targetQueries: input.targetQueries,
      researchNotes: input.researchNotes,
      agentSummary: input.agentSummary,
      timeSensitive: input.timeSensitive ?? false,
      topicId: input.topicId,
    },
    select: { id: true, slug: true },
  });
  if (input.topicId) {
    await prisma.blogTopic.updateMany({
      where: { id: input.topicId },
      data: { status: "USED", usedAt: new Date() },
    });
  }
  return post;
}

/** One pending revision per post: a newer proposal replaces the older one. */
export async function createBlogRevision(input: CreateRevisionInput) {
  const post = await prisma.blogPost.findUnique({
    where: { id: input.postId },
    select: { id: true, status: true, bodyHtml: true, updatedAt: true },
  });
  if (!post) throw new BlogAgentError("Post not found", 404);
  if (post.status !== "PUBLISHED") {
    throw new BlogAgentError("Only published posts take revisions; edit drafts directly", 409);
  }

  return prisma.$transaction(async (tx) => {
    await tx.blogPostRevision.updateMany({
      where: { postId: post.id, status: "PENDING" },
      data: { status: "DISCARDED", resolvedAt: new Date() },
    });
    return tx.blogPostRevision.create({
      data: {
        postId: post.id,
        baseBodyHtml: post.bodyHtml,
        baseUpdatedAt: post.updatedAt,
        proposedBodyHtml: sanitizeBlogHtml(input.proposedBodyHtml),
        proposedTitle: input.proposedTitle,
        proposedSeoTitle: input.proposedSeoTitle,
        proposedSeoDescription: input.proposedSeoDescription,
        proposedExcerpt: input.proposedExcerpt,
        proposedFaqs: input.proposedFaqs,
        changeNotes: input.changeNotes,
        targetQueries: input.targetQueries,
        agentSummary: input.agentSummary,
      },
      select: { id: true, postId: true },
    });
  });
}

export async function applyTopicsBatch(input: TopicsBatchInput) {
  const created = await Promise.all(
    (input.create ?? []).map((topic) =>
      prisma.blogTopic.create({
        data: {
          ...topic,
          expiresAt: topic.expiresAt ? new Date(topic.expiresAt) : undefined,
        },
        select: { id: true, title: true },
      }),
    ),
  );
  const updated = await Promise.all(
    (input.update ?? []).map(({ id, ...data }) =>
      prisma.blogTopic.updateMany({
        where: { id },
        data: { ...data, usedAt: data.status === "USED" ? new Date() : undefined },
      }),
    ),
  );
  return { created, updatedCount: updated.reduce((sum, r) => sum + r.count, 0) };
}
