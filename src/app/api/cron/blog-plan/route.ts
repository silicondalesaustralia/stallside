import { NextRequest, NextResponse } from "next/server";
import { dispatchBlogPlan } from "@/lib/blog/github-dispatch";

export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function adelaideHour(now: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Adelaide", hour: "numeric", hourCycle: "h23" }).format(now),
  );
}

/**
 * Daily planner cron is paused — topics are added manually in the admin UI and written from there.
 * Route kept so a manual GET (with CRON_SECRET) can still dispatch if needed; set ?force=1 to run.
 * Previously: 10:30 / 11:30 UTC, only the hit at 9pm Adelaide started the planner.
 */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (req.nextUrl.searchParams.get("force") !== "1") {
    return NextResponse.json({
      paused: true,
      reason: "Daily blog planner paused; add topics in the admin UI.",
    });
  }

  try {
    await dispatchBlogPlan();
    return NextResponse.json({ started: true, adelaideHour: adelaideHour(new Date()) });
  } catch (error) {
    console.error("[cron/blog-plan] dispatch failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Dispatch failed" }, { status: 500 });
  }
}
