import { NextResponse, type NextRequest } from "next/server";
import {
  blogAgentBadRequest,
  blogAgentUnauthorized,
  isBlogAgentRequest,
  readJsonBody,
} from "@/lib/blog/agent-auth";
import { topicsBatchSchema } from "@/lib/blog/agent-schemas";
import { applyTopicsBatch } from "@/lib/blog/agent-writes";

export const runtime = "nodejs";

/** Batch create new backlog topics and/or update existing ones. */
export async function POST(req: NextRequest) {
  if (!isBlogAgentRequest(req)) return blogAgentUnauthorized();
  const body = await readJsonBody(req);
  if (body === null) return blogAgentBadRequest("Body must be JSON");
  const parsed = topicsBatchSchema.safeParse(body);
  if (!parsed.success) return blogAgentBadRequest("Invalid topics batch", parsed.error.issues);

  try {
    return NextResponse.json(await applyTopicsBatch(parsed.data));
  } catch (error) {
    console.error("[blog-agent] topics batch failed", error);
    return NextResponse.json({ error: "Failed to save topics" }, { status: 500 });
  }
}
