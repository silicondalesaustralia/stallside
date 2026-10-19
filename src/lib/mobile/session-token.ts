import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { MobilePlatform } from "@/contracts/mobile/common";

const SESSION_TTL_MS = 180 * 24 * 60 * 60 * 1000;
const TOUCH_INTERVAL_MS = 60 * 60 * 1000;

export function hashMobileToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

export async function createMobileSession(opts: {
  userId: string;
  platform: MobilePlatform;
  deviceName?: string;
  appVersion?: string;
}): Promise<{ token: string; expiresAt: Date }> {
  const token = `vms_${crypto.randomBytes(32).toString("base64url")}`;
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.mobileSession.create({
    data: {
      userId: opts.userId,
      tokenHash: hashMobileToken(token),
      platform: opts.platform,
      deviceName: opts.deviceName || null,
      appVersion: opts.appVersion || null,
      expiresAt,
    },
  });
  return { token, expiresAt };
}

/** Active session for a raw token; extends the expiry while the app keeps being used. */
export async function findActiveMobileSession(
  token: string,
): Promise<{ id: string; userId: string } | null> {
  const row = await prisma.mobileSession.findUnique({
    where: { tokenHash: hashMobileToken(token) },
    select: { id: true, userId: true, expiresAt: true, revokedAt: true, lastUsedAt: true },
  });
  const now = Date.now();
  if (!row || row.revokedAt || row.expiresAt.getTime() <= now) return null;

  if (now - row.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
    await prisma.mobileSession.update({
      where: { id: row.id },
      data: { lastUsedAt: new Date(now), expiresAt: new Date(now + SESSION_TTL_MS) },
    });
  }
  return { id: row.id, userId: row.userId };
}

export async function revokeMobileSession(sessionId: string): Promise<void> {
  await prisma.mobileSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
