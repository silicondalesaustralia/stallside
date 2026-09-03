import { prisma } from "@/lib/prisma";
import { GROW_ORDER_STATUSES } from "@/lib/grow/segments";

/** Award loyalty points once per qualifying paid order. Idempotent. */
export async function earnLoyaltyForOrder(input: {
  ownerId: string;
  orderId: string;
  customerId: string | null;
  totalCents: number;
  currency: string;
}) {
  if (!input.customerId || input.totalCents <= 0) return;

  const program = await prisma.loyaltyProgram.findUnique({
    where: { ownerId: input.ownerId },
  });
  if (!program?.isActive) return;

  const order = await prisma.order.findFirst({
    where: {
      id: input.orderId,
      ownerId: input.ownerId,
      paymentStatus: { in: GROW_ORDER_STATUSES },
    },
    select: { id: true },
  });
  if (!order) return;

  const units = Math.floor(input.totalCents / 100);
  const points = units * program.pointsPerCurrency;
  if (points <= 0) return;

  const account = await prisma.loyaltyAccount.upsert({
    where: { customerId: input.customerId },
    create: {
      programId: program.id,
      customerId: input.customerId,
      balance: 0,
    },
    update: {},
  });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: "ORDER_EARN",
          points,
          orderId: input.orderId,
        },
      });
      await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: { balance: { increment: points } },
      });
    });
  } catch {
    // Unique constraint = already earned for this order
  }
}

export async function redeemLoyaltyReward(input: {
  ownerId: string;
  customerId: string;
}): Promise<{ ok: true; code: string } | { error: string }> {
  const program = await prisma.loyaltyProgram.findUnique({
    where: { ownerId: input.ownerId },
  });
  if (!program?.isActive) return { error: "Loyalty not enabled" };

  const account = await prisma.loyaltyAccount.findUnique({
    where: { customerId: input.customerId },
  });
  if (!account || account.balance < program.rewardThreshold) {
    return { error: "Not enough points" };
  }

  const code = `LOYAL-${program.rewardThreshold}-${Date.now().toString(36).toUpperCase()}`;
  await prisma.$transaction(async (tx) => {
    await tx.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: "REWARD_REDEEM",
        points: -program.rewardThreshold,
        note: `Redeemed for ${code}`,
      },
    });
    await tx.loyaltyAccount.update({
      where: { id: account.id },
      data: { balance: { decrement: program.rewardThreshold } },
    });
    await tx.promotion.create({
      data: {
        ownerId: input.ownerId,
        code,
        name: `${program.name} reward`,
        type: "FIXED_OFF",
        amountOffCents: program.rewardCents,
        perCustomerLimit: 1,
        usageLimit: 1,
        isActive: true,
      },
    });
  });

  return { ok: true, code };
}
