import { NextResponse } from "next/server";
import { assistantOwnerIdFromSession } from "@/lib/website-ai/assistant/access";
import { kickJobIfIdle } from "@/lib/website-ai/assistant/jobs/kick";
import { loadJobStatus } from "@/lib/website-ai/assistant/jobs/status";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Owner-scoped build status. Also advances the build, since Preview deployments have no cron. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ownerId = await assistantOwnerIdFromSession();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const status = await loadJobStatus(ownerId, id);
    if (!status) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await kickJobIfIdle(id);
    return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[website-ai] status failed", id, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not load build status." }, { status: 500 });
  }
}
