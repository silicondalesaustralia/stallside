import { createHash, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { cleanEnvSecret } from "@/lib/env";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

/** Bearer BLOG_AGENT_TOKEN. Fails closed when the token is not configured. */
export function isBlogAgentRequest(req: NextRequest): boolean {
  const secret = cleanEnvSecret(process.env.BLOG_AGENT_TOKEN);
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return timingSafeEqual(digest(match[1].trim()), digest(secret));
}

export function blogAgentUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Parse a JSON body; returns null when the body is not valid JSON. */
export async function readJsonBody(req: NextRequest): Promise<unknown | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export function blogAgentBadRequest(message: string, issues?: unknown) {
  return NextResponse.json({ error: message, issues }, { status: 400 });
}
