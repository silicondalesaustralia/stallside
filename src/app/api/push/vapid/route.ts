import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/** Public VAPID key for client subscribe (safe to expose; private key stays server-only). */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const publicKey =
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ||
      process.env.VAPID_PUBLIC_KEY?.trim() ||
      "";

    if (!publicKey) {
      return NextResponse.json(
        { error: "VAPID public key not configured" },
        { status: 503 },
      );
    }

    return NextResponse.json({ publicKey });
  } catch (error) {
    console.error("VAPID public key fetch failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
