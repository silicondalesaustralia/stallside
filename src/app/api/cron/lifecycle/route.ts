import { NextRequest, NextResponse } from "next/server";
import { runCreatorDay3Cron } from "@/lib/lifecycle-emails/run-creator-day3-cron";
import { runProLapseCron } from "@/lib/lifecycle-emails/run-pro-lapse-cron";

export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Daily: Day 3 creator intro + Pro lapse Day 23 / Day 45. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const [creator, lapse] = await Promise.all([
    runCreatorDay3Cron(now),
    runProLapseCron(now),
  ]);

  return NextResponse.json({
    checkedCreatorDay3: creator.checked,
    checkedProLapse: lapse.checked,
    sent: {
      creatorDay3: creator.sent,
      proLapse23: lapse.day23,
      proLapse45: lapse.day45,
    },
  });
}
