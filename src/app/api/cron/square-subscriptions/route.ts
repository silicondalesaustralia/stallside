import { NextResponse } from "next/server";
import { isSquareSubscriptionsEnabled } from "@/lib/square/config";
import { runSquareSubscriptionBilling } from "@/lib/square-subscriptions/run-billing";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Hourly: charge saved Square cards for due subscriptions and memberships. */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSquareSubscriptionsEnabled()) {
    return NextResponse.json({ skipped: true, reason: "flag_off" });
  }
  try {
    const totals = await runSquareSubscriptionBilling();
    return NextResponse.json({ ok: true, ...totals });
  } catch (error) {
    console.error("Square subscription billing run failed", error);
    return NextResponse.json({ error: "billing run failed" }, { status: 500 });
  }
}
