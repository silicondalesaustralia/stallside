import { NextRequest, NextResponse } from "next/server";
import { runCreatorDay3Cron } from "@/lib/lifecycle-emails/run-creator-day3-cron";
import { runProLapseCron } from "@/lib/lifecycle-emails/run-pro-lapse-cron";
import {
  runStripeNeverStartedNudgeCron,
  runStripeRestrictedNudgeCron,
} from "@/lib/lifecycle-emails/run-stripe-nudges-cron";
import { journeysEnabled } from "@/lib/lifecycle-emails/journeys/config";
import { runJourneysCron } from "@/lib/lifecycle-emails/journeys/run-journeys-cron";

export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Daily: Day 3 creator intro (or v2 journeys when enabled) + Pro lapse Day 23 / Day 45 + Stripe nudges. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const v2 = journeysEnabled();
  const [creator, journeys, lapse, stripeRestricted, stripeNeverStarted] = await Promise.all([
    v2 ? Promise.resolve({ checked: 0, sent: 0 }) : runCreatorDay3Cron(now),
    v2 ? runJourneysCron(now) : Promise.resolve(null),
    runProLapseCron(now),
    runStripeRestrictedNudgeCron(now),
    runStripeNeverStartedNudgeCron(now),
  ]);

  return NextResponse.json({
    journeys,
    checkedCreatorDay3: creator.checked,
    checkedProLapse: lapse.checked,
    checkedStripeRestricted: stripeRestricted.checked,
    checkedStripeNeverStarted: stripeNeverStarted.checked,
    sent: {
      creatorDay3: creator.sent,
      proLapse23: lapse.day23,
      proLapse45: lapse.day45,
      stripeRestricted: stripeRestricted.sent,
      stripeNeverStarted: stripeNeverStarted.sent,
    },
  });
}
