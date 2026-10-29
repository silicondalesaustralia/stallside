import { NextResponse } from "next/server";
import {
  applyResendEvent,
  type ResendWebhookPayload,
} from "@/lib/email-stats/apply-resend-event";
import { verifyResendWebhook } from "@/lib/email-stats/verify-resend-webhook";

export async function POST(req: Request) {
  const body = await req.text();
  const svixId = req.headers.get("svix-id");
  const verified = verifyResendWebhook(body, {
    id: svixId,
    timestamp: req.headers.get("svix-timestamp"),
    signature: req.headers.get("svix-signature"),
  });
  if (!verified || !svixId) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: ResendWebhookPayload;
  try {
    payload = JSON.parse(body) as ResendWebhookPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  try {
    const result = await applyResendEvent(svixId, payload);
    if (result === "retry") {
      return NextResponse.json({ error: "send not logged yet" }, { status: 409 });
    }
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[resend webhook] failed to apply event", { svixId, error });
    return NextResponse.json({ error: "apply failed" }, { status: 500 });
  }
}
