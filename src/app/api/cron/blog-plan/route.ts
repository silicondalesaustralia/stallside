import { NextRequest, NextResponse } from "next/server";
import { dispatchBlogPlan } from "@/lib/blog/github-dispatch";

export const runtime = "nodejs";

const PLAN_HOUR = 21;

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

/** Scheduled at 10:30 and 11:30 UTC; only the one landing at 9pm Adelaide (either daylight saving state) starts the planner. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const hour = adelaideHour(new Date());
  if (hour !== PLAN_HOUR) return NextResponse.json({ skipped: true, adelaideHour: hour });

  try {
    await dispatchBlogPlan();
    return NextResponse.json({ started: true });
  } catch (error) {
    console.error("[cron/blog-plan] dispatch failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Dispatch failed" }, { status: 500 });
  }
}
