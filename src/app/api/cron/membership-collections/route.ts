import { NextRequest, NextResponse } from "next/server";
import { runMembershipCollectionCron } from "@/lib/run-membership-collection-cron";

export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Daily: create due weekly collection orders for memberships. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runMembershipCollectionCron(new Date());
  return NextResponse.json(result);
}
