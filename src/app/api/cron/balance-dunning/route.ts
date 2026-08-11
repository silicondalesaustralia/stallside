import { NextRequest, NextResponse } from "next/server";
import { runBalanceDunningCron } from "@/lib/balance-dunning";

export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Daily: charge due balances, dunning retries, cancel after final failure. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runBalanceDunningCron(new Date());
  return NextResponse.json(result);
}
