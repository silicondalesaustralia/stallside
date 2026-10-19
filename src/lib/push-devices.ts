import { prisma } from "@/lib/prisma";

export type PushPlatform = "ios" | "android" | "web";

/** Shared by the web dashboard and the native app so a device is registered the same way from either. */
export async function registerPushDevice(
  ownerId: string,
  token: string,
  platform: PushPlatform,
): Promise<void> {
  await prisma.pushDevice.upsert({
    where: { token },
    create: { ownerId, token, platform },
    update: { ownerId, platform },
  });
}

export async function unregisterPushDevice(ownerId: string, token: string): Promise<void> {
  await prisma.pushDevice.deleteMany({ where: { token, ownerId } });
}
