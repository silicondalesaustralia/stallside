import { NextResponse, type NextRequest } from "next/server";
import {
  blogAgentBadRequest,
  blogAgentUnauthorized,
  isBlogAgentRequest,
  readJsonBody,
} from "@/lib/blog/agent-auth";
import { createDraftSchema } from "@/lib/blog/agent-schemas";
import { createBlogDraft } from "@/lib/blog/agent-writes";
import { adminBlogPostPath } from "@/lib/blog/paths";
import { SITE_URL } from "@/lib/legal";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isBlogAgentRequest(req)) return blogAgentUnauthorized();
  const body = await readJsonBody(req);
  if (body === null) return blogAgentBadRequest("Body must be JSON");
  const parsed = createDraftSchema.safeParse(body);
  if (!parsed.success) return blogAgentBadRequest("Invalid draft", parsed.error.issues);

  try {
    const post = await createBlogDraft(parsed.data);
    return NextResponse.json(
      { ...post, reviewUrl: `${SITE_URL}${adminBlogPostPath(post.id)}` },
      { status: 201 },
    );
  } catch (error) {
    console.error("[blog-agent] draft create failed", error);
    return NextResponse.json({ error: "Failed to create draft" }, { status: 500 });
  }
}
