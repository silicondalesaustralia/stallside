import { NextResponse } from "next/server";
import { syncPendingProcessorFees } from "@/lib/order-fees/sync-pending-fees";

const LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Record Stripe / Square / PayPal processing fees on recently paid orders. */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncPendingProcessorFees({
      since: new Date(Date.now() - LOOKBACK_MS),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Order fee sync cron failed", error);
    return NextResponse.json({ error: "sync failed" }, { status: 500 });
  }
}
