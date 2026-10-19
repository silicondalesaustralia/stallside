import { redirect, unstable_rethrow } from "next/navigation";
import type { NextRequest } from "next/server";
import { signIn } from "@/lib/auth";
import { safeHandoffPath } from "@/lib/mobile/web-handoff";

/** Opened in the app's in-app browser: trades the one-time token for a web session, then lands on `next`. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const next = safeHandoffPath(request.nextUrl.searchParams.get("next")) ?? "/dashboard";

  try {
    await signIn("mobile-handoff", { token, redirectTo: next });
  } catch (error) {
    unstable_rethrow(error);
    console.warn("Mobile web hand-off failed", error);
  }
  redirect(`/login?callbackUrl=${encodeURIComponent(next)}`);
}
