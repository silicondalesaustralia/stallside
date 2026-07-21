import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@/generated/prisma/client";
import { appBaseUrl } from "@/lib/app-url";

export function lifetimeInviteUrl(token: string): string {
  return `${appBaseUrl()}/invite/${token}`;
}

export async function createLifetimeInvite(note?: string) {
  const token = randomBytes(18).toString("base64url");
  return prisma.lifetimeInvite.create({
    data: {
      token,
      note: note?.trim() || null,
    },
  });
}

/** Valid unused invite (may already be claimed by this email). */
export async function getOpenLifetimeInvite(token: string) {
  const invite = await prisma.lifetimeInvite.findUnique({ where: { token } });
  if (!invite || invite.usedAt) return null;
  return invite;
}

/**
 * Hold this invite for `email` so another person cannot start the same link.
 * Re-claiming with the same email is allowed (OTP retry).
 */
export async function claimLifetimeInvite(token: string, email: string) {
  const result = await prisma.lifetimeInvite.updateMany({
    where: {
      token,
      usedAt: null,
      OR: [{ claimedEmail: null }, { claimedEmail: email }],
    },
    data: { claimedEmail: email },
  });
  return result.count === 1;
}

/** Create owner on Card plan, active, $0 forever. */
export async function createOwnerWithLifetime(input: {
  userId: string;
  name: string;
  email: string;
}) {
  const now = new Date();
  const displayName = input.name.trim() || "My stand";

  return prisma.owner.create({
    data: {
      userId: input.userId,
      businessName: displayName,
      contactEmail: input.email,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: "card",
      lifetimeAccess: true,
      monthlyFeeCents: 0,
      subscriptionStartedAt: now,
      trialEndsAt: null,
    },
  });
}

/** Mark invite used; returns false if already spent or not claimed by this email. */
export async function consumeLifetimeInvite(input: {
  token: string;
  email: string;
  userId: string;
}) {
  const result = await prisma.lifetimeInvite.updateMany({
    where: {
      token: input.token,
      usedAt: null,
      claimedEmail: input.email,
    },
    data: {
      usedAt: new Date(),
      usedByEmail: input.email,
      usedByUserId: input.userId,
    },
  });
  return result.count === 1;
}
