import { after, NextResponse } from "next/server";
import { appBaseUrl } from "@/lib/app-url";
import {
  verifySquareWebhookSignature,
  type SquareWebhookEnvelope,
} from "@/lib/square/webhook-verify";
import {
  persistSquareWebhookReceipt,
  processSquareWebhookReceipt,
} from "@/lib/square/webhook-process";
import { isSquareIntegrationEnabled } from "@/lib/square/config";

export async function POST(req: Request) {
  if (!isSquareIntegrationEnabled()) {
    return NextResponse.json({ error: "disabled" }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature");
  const notificationUrl = `${appBaseUrl()}/api/square/webhook`;

  if (
    !verifySquareWebhookSignature({
      body,
      signatureHeader: signature,
      notificationUrl,
    })
  ) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let envelope: SquareWebhookEnvelope;
  try {
    envelope = JSON.parse(body) as SquareWebhookEnvelope;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { id, duplicate } = await persistSquareWebhookReceipt(envelope, envelope);
  if (id && !duplicate) {
    after(async () => {
      await processSquareWebhookReceipt(id);
    });
  }

  return NextResponse.json({ ok: true });
}
