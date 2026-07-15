import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { LEGAL_EMAIL } from "@/lib/legal";

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

function vapidConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  );
}

function configureVapid() {
  webpush.setVapidDetails(
    `mailto:${LEGAL_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
}

export async function sendWebPush(subscriptionJson: string, payload: PushPayload) {
  if (!vapidConfigured()) {
    console.log(
      `\n[${APP_NAME} WebPush] ${subscriptionJson.slice(0, 48)}…\n${payload.title}\n${payload.body}\n`,
    );
    return;
  }

  let subscription: webpush.PushSubscription;
  try {
    subscription = JSON.parse(subscriptionJson) as webpush.PushSubscription;
  } catch {
    console.error("Web push: invalid subscription JSON");
    await prisma.pushDevice.deleteMany({ where: { token: subscriptionJson } });
    return;
  }

  configureVapid();
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
      }),
    );
  } catch (error) {
    const status =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode: number }).statusCode)
        : 0;
    console.error("Web push send failed", status || error);
    if (status === 404 || status === 410) {
      await prisma.pushDevice.deleteMany({ where: { token: subscriptionJson } });
    }
  }
}
