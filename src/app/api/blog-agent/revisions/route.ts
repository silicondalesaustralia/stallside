import { NextResponse, type NextRequest } from "next/server";
import {
  blogAgentBadRequest,
  blogAgentUnauthorized,
  isBlogAgentRequest,
  readJsonBody,
} from "@/lib/blog/agent-auth";
import { createRevisionSchema } from "@/lib/blog/agent-schemas";
import { BlogAgentError, createBlogRevision } from "@/lib/blog/agent-writes";
import { adminBlogRevisionPath } from "@/lib/blog/paths";
import { SITE_URL } from "@/lib/legal";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isBlogAgentRequest(req)) return blogAgentUnauthorized();
  const body = await readJsonBody(req);
  if (body === null) return blogAgentBadRequest("Body must be JSON");
  const parsed = createRevisionSchema.safeParse(body);
  if (!parsed.success) return blogAgentBadRequest("Invalid revision", parsed.error.issues);

  try {
    const revision = await createBlogRevision(parsed.data);
    return NextResponse.json(
      { ...revision, reviewUrl: `${SITE_URL}${adminBlogRevisionPath(revision.id)}` },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof BlogAgentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[blog-agent] revision create failed", error);
    return NextResponse.json({ error: "Failed to create revision" }, { status: 500 });
  }
}
