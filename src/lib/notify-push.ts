import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

async function sendFcm(token: string, payload: PushPayload) {
  const key = process.env.FCM_SERVER_KEY;
  if (!key) {
    console.log(
      `\n[${APP_NAME} push] ${token.slice(0, 12)}…\n${payload.title}\n${payload.body}\n`,
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
  await Promise.all(devices.map((d) => sendFcm(d.token, payload)));
}
