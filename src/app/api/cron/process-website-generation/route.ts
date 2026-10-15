import { NextRequest, NextResponse } from "next/server";
import { dueJobIds } from "@/lib/website-ai/assistant/jobs/lease";
import { processJob } from "@/lib/website-ai/assistant/jobs/process";

export const runtime = "nodejs";
export const maxDuration = 300;

const BUDGET_MS = 250_000;

/** Cron / manual trigger: advances due AI website builds, recovering expired leases. */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const started = Date.now();
  try {
    const ids = await dueJobIds(5);
    let processed = 0;
    for (const id of ids) {
      const left = BUDGET_MS - (Date.now() - started);
      if (left < 30_000) break;
      await processJob(id, left);
      processed += 1;
    }
    return NextResponse.json({ ok: true, due: ids.length, processed, timestamp: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Cron process-website-generation] Failed", { error: message });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
