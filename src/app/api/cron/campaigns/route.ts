import { NextResponse } from "next/server";
import { drainCampaignSends } from "@/lib/grow/drain-campaign-sends";

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

  try {
    const total = await drainCampaignSends();
    return NextResponse.json({ ok: true, processed: total });
  } catch (error) {
    console.error("Campaign cron failed", error);
    return NextResponse.json({ error: "Campaign send failed" }, { status: 500 });
  }
}
