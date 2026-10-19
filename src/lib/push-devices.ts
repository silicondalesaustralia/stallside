import { prisma } from "@/lib/prisma";

export type PushPlatform = "ios" | "android" | "web";

const APP_PLATFORMS = ["ios", "android"];

/**
 * Once the owner has the phone app, alerts go to the app only - not also to the browser
 * (web push) on the same phone. Owners without the app keep getting web push.
 */
export function pushTargets<T extends { platform: string }>(devices: T[]): T[] {
  const app = devices.filter((device) => APP_PLATFORMS.includes(device.platform));
  return app.length > 0 ? app : devices;
}

export function countAppDevices(ownerId: string): Promise<number> {
  return prisma.pushDevice.count({ where: { ownerId, platform: { in: APP_PLATFORMS } } });
}

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
