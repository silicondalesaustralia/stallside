import { NextResponse, type NextRequest } from "next/server";
import {
  blogAgentBadRequest,
  blogAgentUnauthorized,
  isBlogAgentRequest,
  readJsonBody,
} from "@/lib/blog/agent-auth";
import { recommendationsBatchSchema } from "@/lib/blog/recommendation-schemas";
import { saveAndEmailRecommendations } from "@/lib/blog/recommendations";

export const runtime = "nodejs";

/** Evening planning run: store up to 10 ranked ideas and email them with "Write this" links. */
export async function POST(req: NextRequest) {
  if (!isBlogAgentRequest(req)) return blogAgentUnauthorized();
  const body = await readJsonBody(req);
  if (body === null) return blogAgentBadRequest("Body must be JSON");
  const parsed = recommendationsBatchSchema.safeParse(body);
  if (!parsed.success) return blogAgentBadRequest("Invalid recommendations", parsed.error.issues);

  try {
    const topics = await saveAndEmailRecommendations(parsed.data);
    return NextResponse.json({ ok: true, topics });
  } catch (error) {
    console.error("[blog-agent] recommendations failed", error);
    return NextResponse.json({ error: "Failed to save or email recommendations" }, { status: 500 });
  }
}
