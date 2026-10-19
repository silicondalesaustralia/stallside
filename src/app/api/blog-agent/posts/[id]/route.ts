import { NextResponse, type NextRequest } from "next/server";
import { blogAgentUnauthorized, isBlogAgentRequest } from "@/lib/blog/agent-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Full post body so the agent can propose a revision against current content. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isBlogAgentRequest(req)) return blogAgentUnauthorized();
  const { id } = await params;
  try {
    const post = await prisma.blogPost.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        revisions: {
          where: { status: "PENDING" },
          select: { id: true, createdAt: true },
        },
      },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error("[blog-agent] post load failed", error);
    return NextResponse.json({ error: "Failed to load post" }, { status: 500 });
  }
}
