import { NextResponse } from "next/server";
import { APP_NAME } from "@/lib/constants";
import {
  optOutLifecycleEmails,
  verifyLifecycleUnsub,
} from "@/lib/lifecycle-emails/unsubscribe";

/** RFC 8058 one-click List-Unsubscribe POST. */
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("t")?.trim() ?? "";
  const email = verifyLifecycleUnsub(token);
  if (!email) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    await optOutLifecycleEmails(email);
  } catch (error) {
    console.error(`[${APP_NAME}] one-click lifecycle unsubscribe failed`, error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
  return new NextResponse(null, { status: 200 });
}
