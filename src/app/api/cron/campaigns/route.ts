import { NextResponse } from "next/server";
import { processCampaignSendBatch } from "@/lib/grow/campaigns";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "CRON_SECRET missing" }, { status: 500 });
  }

  let total = 0;
  for (let i = 0; i < 10; i += 1) {
    const result = await processCampaignSendBatch();
    total += result.processed;
    if (!result.processed || result.finished) break;
  }

  return NextResponse.json({ ok: true, processed: total });
}
