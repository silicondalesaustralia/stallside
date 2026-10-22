import { NextResponse } from "next/server";
import { sweepPendingCardCheckouts } from "@/lib/stripe-checkout-sweep";
import { sweepPendingSquareCheckouts } from "@/lib/square/checkout-sweep";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Expire abandoned card checkouts and catch paid ones that were never marked paid. */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const stripe = await sweepPendingCardCheckouts();
    const square = await sweepPendingSquareCheckouts();
    return NextResponse.json({ ok: true, stripe, square });
  } catch (error) {
    console.error("Stripe checkout sweep failed", error);
    return NextResponse.json({ error: "sweep failed" }, { status: 500 });
  }
}
