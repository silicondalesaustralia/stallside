import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOwnerEmail } from "@/lib/notify-email";
import { appBaseUrl } from "@/lib/app-url";
import { APP_NAME } from "@/lib/constants";
import { SubscriptionStatus } from "@/generated/prisma/client";

export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await prisma.owner.findMany({
    where: {
      subscriptionStatus: SubscriptionStatus.TRIALING,
      stripeSubscriptionId: null,
      trialEndsAt: { lte: now },
      trialReminderSentAt: null,
    },
    include: { user: { select: { email: true } } },
    take: 100,
  });

  const billingUrl = `${appBaseUrl()}/dashboard/settings/billing`;
  let sent = 0;

  for (const owner of due) {
    const to = owner.user.email || owner.contactEmail;
    try {
      await sendOwnerEmail(
        to,
        `Your ${APP_NAME} free trial has ended. Subscribe to keep going`,
        `
          <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
            <p style="font-size:18px;font-weight:600">Your free trial has ended</p>
            <p>Hi ${owner.businessName}, thanks for trying ${APP_NAME}. To keep your stand online, pick a plan and add a payment method.</p>
            <p style="margin:24px 0">
              <a href="${billingUrl}"
                 style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">
                Subscribe now
              </a>
            </p>
            <p style="font-size:12px;color:#56684F">Or open: ${billingUrl}</p>
          </div>
        `,
      );
      await prisma.owner.update({
        where: { id: owner.id },
        data: { trialReminderSentAt: now },
      });
      sent += 1;
    } catch (error) {
      console.error("Trial reminder failed", owner.id, error);
    }
  }

  return NextResponse.json({ checked: due.length, sent });
}
