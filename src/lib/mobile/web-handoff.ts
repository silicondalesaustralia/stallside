import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashMobileToken } from "@/lib/mobile/session-token";

const HANDOFF_TTL_MS = 60_000;
const IDENTIFIER_PREFIX = "mobile-web:";

/** Only dashboard/onboarding pages on our own origin, so a link can't be turned into an open redirect. */
export function safeHandoffPath(raw: string | null | undefined): string | null {
  const path = (raw ?? "").trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return null;
  return /^\/(dashboard|onboarding)(\/|\?|$)/.test(path) ? path : null;
}

/** Single-use, 60-second token that signs the app's user into the website. */
export async function createWebHandoff(userId: string): Promise<string> {
  const token = `vwh_${crypto.randomBytes(32).toString("base64url")}`;
  const identifier = `${IDENTIFIER_PREFIX}${userId}`;
  await prisma.verificationToken.deleteMany({
    where: { identifier, expires: { lt: new Date() } },
  });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashMobileToken(token),
      expires: new Date(Date.now() + HANDOFF_TTL_MS),
    },
  });
  return token;
}

/** Burns the token and returns its user, or null if it's unknown, used, or expired. */
export async function consumeWebHandoff(token: string) {
  if (!token.startsWith("vwh_")) return null;
  const hash = hashMobileToken(token);
  const row = await prisma.verificationToken.findUnique({ where: { token: hash } });
  if (!row || !row.identifier.startsWith(IDENTIFIER_PREFIX)) return null;

  const burned = await prisma.verificationToken.deleteMany({ where: { token: hash } });
  if (burned.count === 0 || row.expires.getTime() < Date.now()) return null;

  const userId = row.identifier.slice(IDENTIFIER_PREFIX.length);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { owner: { select: { deletedAt: true } } },
  });
  if (!user || user.owner?.deletedAt) return null;
  return user;
}
