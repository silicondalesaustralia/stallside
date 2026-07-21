import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@/generated/prisma/client";
import { appBaseUrl } from "@/lib/app-url";

export function lifetimeInviteUrl(token: string): string {
  return `${appBaseUrl()}/invite/${token}`;
}

export function inviteHasSeats(invite: { useCount: number; maxUses: number }) {
  return invite.useCount < invite.maxUses;
}

export async function createLifetimeInvite(input?: {
  note?: string;
  maxUses?: number;
}) {
  const maxUses = Math.min(500, Math.max(1, Math.floor(input?.maxUses ?? 1)));
  const token = randomBytes(18).toString("base64url");
  return prisma.lifetimeInvite.create({
    data: {
      token,
      note: input?.note?.trim() || null,
      maxUses,
    },
  });
}

/** Invite exists and still has seats. */
export async function getOpenLifetimeInvite(token: string) {
  const invite = await prisma.lifetimeInvite.findUnique({ where: { token } });
  if (!invite || !inviteHasSeats(invite)) return null;
  return invite;
}

/** Invite row even when full (for closed-offer messaging). */
export async function getLifetimeInvite(token: string) {
  return prisma.lifetimeInvite.findUnique({ where: { token } });
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

/**
 * Atomically take one seat. Returns false if full or this email already redeemed.
 */
export async function consumeLifetimeInvite(input: {
  token: string;
  email: string;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const invite = await tx.lifetimeInvite.findUnique({
      where: { token: input.token },
    });
    if (!invite || !inviteHasSeats(invite)) return false;

    const already = await tx.lifetimeInviteRedemption.findUnique({
      where: {
        inviteId_email: { inviteId: invite.id, email: input.email },
      },
    });
    if (already) return false;

    const seats = await tx.lifetimeInvite.updateMany({
      where: {
        id: invite.id,
        useCount: invite.useCount,
      },
      data: { useCount: { increment: 1 } },
    });
    if (seats.count !== 1) return false;

    await tx.lifetimeInviteRedemption.create({
      data: {
        inviteId: invite.id,
        email: input.email,
        userId: input.userId,
      },
    });
    return true;
  });
}
