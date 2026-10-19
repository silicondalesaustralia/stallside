"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { publishBlockers } from "@/lib/blog/admin-form";
import { adminBlogPath, adminBlogPostPath, adminBlogRevisionPath } from "@/lib/blog/paths";
import { revalidateBlogPost } from "@/lib/blog/revalidate";
import { sanitizeBlogHtml } from "@/lib/blog/sanitize-blog-html";
import { blogFaqSchema } from "@/lib/blog/types";

const revisionFormSchema = z.object({
  revisionId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  seoTitle: z.string().trim().min(1).max(70),
  seoDescription: z.string().trim().max(170),
  excerpt: z.string().trim().max(400),
  bodyHtml: z.string().max(200_000),
  faqsJson: z.string().max(40_000).optional(),
  confirmStale: z.string().optional(),
});

function back(id: string, error: string): never {
  redirect(`${adminBlogRevisionPath(id)}?${new URLSearchParams({ error })}`);
}

function parseFaqs(raw: string | undefined) {
  if (!raw) return [];
  try {
    const parsed = z.array(blogFaqSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export async function publishRevisionAction(formData: FormData) {
  await requireAdmin();
  const parsed = revisionFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const id = String(formData.get("revisionId") ?? "");
    back(id, parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  const input = parsed.data;
  const revision = await prisma.blogPostRevision.findUnique({
    where: { id: input.revisionId },
    include: { post: true },
  });
  if (!revision || revision.status !== "PENDING") back(input.revisionId, "Revision is no longer pending");

  const stale = revision.post.updatedAt > revision.baseUpdatedAt;
  if (stale && input.confirmStale !== "1") {
    back(input.revisionId, "The live post changed after this revision was drafted. Tick the confirm box to overwrite.");
  }

  const bodyHtml = sanitizeBlogHtml(input.bodyHtml);
  const fields = {
    title: input.title,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    excerpt: input.excerpt,
    bodyHtml,
    faqs: parseFaqs(input.faqsJson),
  };
  const blockers = publishBlockers(fields);
  if (blockers.length) back(input.revisionId, blockers.join("; "));

  const now = new Date();
  await prisma.$transaction([
    prisma.blogPost.update({
      where: { id: revision.postId },
      data: { ...fields, contentUpdatedAt: now },
    }),
    prisma.blogPostRevision.update({
      where: { id: revision.id },
      data: { status: "PUBLISHED", proposedBodyHtml: bodyHtml, resolvedAt: now },
    }),
  ]);
  const { post } = revision;
  revalidateBlogPost(post.section, post.slug, post.alsoListedIn);
  redirect(`${adminBlogPostPath(post.id)}?saved=revision`);
}

export async function discardRevisionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("revisionId") ?? "");
  if (!id) throw new Error("Missing revision id");
  const reason = String(formData.get("discardReason") ?? "").trim();
  if (!reason) back(id, "Add a reason so the agent can learn from it");
  await prisma.blogPostRevision.update({
    where: { id },
    data: { status: "DISCARDED", discardReason: reason.slice(0, 2000), resolvedAt: new Date() },
  });
  redirect(adminBlogPath("revisions"));
}
