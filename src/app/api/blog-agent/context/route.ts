import { NextResponse, type NextRequest } from "next/server";
import { blogAgentUnauthorized, isBlogAgentRequest } from "@/lib/blog/agent-auth";
import { loadBlogAgentContext } from "@/lib/blog/agent-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isBlogAgentRequest(req)) return blogAgentUnauthorized();
  try {
    return NextResponse.json(await loadBlogAgentContext());
  } catch (error) {
    console.error("[blog-agent] context failed", error);
    return NextResponse.json({ error: "Failed to load context" }, { status: 500 });
  }
}
