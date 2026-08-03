import { NextRequest, NextResponse } from "next/server";
import { runProLapseCron } from "@/lib/lifecycle-emails/run-pro-lapse-cron";

export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Daily: Pro lapse Day 23 / Day 45 follow-ups only. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lapse = await runProLapseCron(new Date());

  return NextResponse.json({
    checkedProLapse: lapse.checked,
    sent: {
      proLapse23: lapse.day23,
      proLapse45: lapse.day45,
    },
  });
}
