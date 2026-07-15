import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { sendApns } from "@/lib/notify-apns";
import { sendWebPush } from "@/lib/notify-web-push";

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

async function sendFcm(token: string, payload: PushPayload) {
  const key = process.env.FCM_SERVER_KEY;
  if (!key) {
    console.log(
      `\n[${APP_NAME} FCM] ${token.slice(0, 12)}…\n${payload.title}\n${payload.body}\n`,
    );
    return;
  }

  const res = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      Authorization: `key=${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: token,
      notification: {
        title: payload.title,
        body: payload.body,
        sound: "default",
      },
      data: payload.data ?? {},
      priority: "high",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("FCM send failed", text);
    if (/NotRegistered|InvalidRegistration/i.test(text)) {
      await prisma.pushDevice.deleteMany({ where: { token } });
    }
  }
}

export async function sendOwnerPush(ownerId: string, payload: PushPayload) {
  const devices = await prisma.pushDevice.findMany({ where: { ownerId } });
  await Promise.all(
    devices.map(async (device) => {
      try {
        if (device.platform === "web") {
          await sendWebPush(device.token, payload);
        } else if (device.platform === "ios") {
          await sendApns(device.token, payload);
        } else {
          await sendFcm(device.token, payload);
        }
      } catch (error) {
        console.error("Push send failed", device.platform, error);
      }
    }),
  );
}
