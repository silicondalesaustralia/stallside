import { NextRequest, NextResponse } from "next/server";

import { isStitchstackPartnerConfigured } from "@/lib/stitchstack";
import { listStitchstackSyncOwnerIds, syncStitchstackForOwner } from "@/lib/stitchstack-sync";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Bidirectional Stitchstack sync every 12 hours:
 * Vendl orders → SS, SS pixel analytics → Vendl dashboard cache.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStitchstackPartnerConfigured()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "partner_key_missing",
      timestamp: new Date().toISOString(),
    });
  }

  const ownerIds = await listStitchstackSyncOwnerIds(500);
  let synced = 0;
  let upserted = 0;
  let analyticsOk = 0;
  const errors: Array<{ ownerId: string; message: string }> = [];

  for (const ownerId of ownerIds) {
    try {
      const result = await syncStitchstackForOwner(ownerId);
      synced += 1;
      upserted += result.upserted;
      if (result.analytics) analyticsOk += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Cron stitchstack-sync] owner failed", { ownerId, message });
      errors.push({ ownerId, message: message.slice(0, 200) });
    }
  }

  return NextResponse.json({
    ok: true,
    owners: ownerIds.length,
    synced,
    upserted,
    analyticsOk,
    errors: errors.slice(0, 20),
    timestamp: new Date().toISOString(),
  });
}
