import { prisma } from "@/lib/prisma";
import { sendApns } from "@/lib/notify-apns";
import { sendFcm } from "@/lib/notify-fcm";
import { sendWebPush } from "@/lib/notify-web-push";
import { pushTargets } from "@/lib/push-devices";
import { ownerIdHasProAccess } from "@/lib/owner-pro-access";

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export async function sendOwnerPush(ownerId: string, payload: PushPayload) {
  const [devices, pro] = await Promise.all([
    prisma.pushDevice.findMany({ where: { ownerId } }),
    ownerIdHasProAccess(ownerId),
  ]);
  const targets = pushTargets(devices.filter((device) => pro || device.platform === "web"));
  await Promise.all(
    targets.map(async (device) => {
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
