import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  blogAgentBadRequest,
  blogAgentUnauthorized,
  isBlogAgentRequest,
  readJsonBody,
} from "@/lib/blog/agent-auth";
import { aiVisibilityBatchSchema } from "@/lib/blog/ai-visibility-schema";

export const runtime = "nodejs";

/** Weekly AI-answer visibility run: one row per question. */
export async function POST(req: NextRequest) {
  if (!isBlogAgentRequest(req)) return blogAgentUnauthorized();
  const body = await readJsonBody(req);
  if (body === null) return blogAgentBadRequest("Body must be JSON");
  const parsed = aiVisibilityBatchSchema.safeParse(body);
  if (!parsed.success) return blogAgentBadRequest("Invalid AI visibility batch", parsed.error.issues);

  const runAt = new Date(parsed.data.runAt);
  try {
    const { count } = await prisma.blogAiVisibilityCheck.createMany({
      data: parsed.data.results.map((result) => ({ ...result, runAt })),
    });
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    console.error("[blog-agent] ai-visibility save failed", error);
    return NextResponse.json({ error: "Failed to save AI visibility results" }, { status: 500 });
  }
}
