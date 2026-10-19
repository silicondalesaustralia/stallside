import { NextResponse, type NextRequest } from "next/server";
import {
  blogAgentBadRequest,
  blogAgentUnauthorized,
  isBlogAgentRequest,
  readJsonBody,
} from "@/lib/blog/agent-auth";
import { agentImageSchema, uploadAgentImage } from "@/lib/blog/agent-image-upload";

export const runtime = "nodejs";

/** Upload one generated image (base64) to public blob storage; returns its URL. */
export async function POST(req: NextRequest) {
  if (!isBlogAgentRequest(req)) return blogAgentUnauthorized();
  const body = await readJsonBody(req);
  if (body === null) return blogAgentBadRequest("Body must be JSON");
  const parsed = agentImageSchema.safeParse(body);
  if (!parsed.success) return blogAgentBadRequest("Invalid image", parsed.error.issues);

  try {
    return NextResponse.json(await uploadAgentImage(parsed.data), { status: 201 });
  } catch (error) {
    console.error("[blog-agent] image upload failed", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
