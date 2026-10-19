import { NextResponse, type NextRequest } from "next/server";
import { blogAgentUnauthorized, isBlogAgentRequest } from "@/lib/blog/agent-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One topic for the writer, plus the full live post when it is an update. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isBlogAgentRequest(req)) return blogAgentUnauthorized();
  const { id } = await params;
  try {
    const topic = await prisma.blogTopic.findUnique({ where: { id } });
    if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const targetPost = topic.targetPostSlug
      ? await prisma.blogPost.findFirst({
          where: { slug: topic.targetPostSlug, status: "PUBLISHED" },
          select: {
            id: true,
            slug: true,
            section: true,
            title: true,
            seoTitle: true,
            seoDescription: true,
            excerpt: true,
            bodyHtml: true,
            faqs: true,
            heroImageUrl: true,
          },
        })
      : null;
    return NextResponse.json({ topic, targetPost });
  } catch (error) {
    console.error("[blog-agent] topic load failed", error);
    return NextResponse.json({ error: "Failed to load topic" }, { status: 500 });
  }
}
