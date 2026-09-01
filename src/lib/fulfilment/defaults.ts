import { prisma } from "@/lib/prisma";
import {
  FulfilmentOptionKind,
  HandoverMode,
  PaymentTiming,
} from "@/generated/prisma/client";

/** Auto-provision implicit QR / farm-gate option — idempotent. */
export async function ensureStandImmediateOption(stand: {
  id: string;
  ownerId: string;
  name: string;
  locationLabel?: string | null;
}) {
  const existing = await prisma.fulfilmentOption.findFirst({
    where: {
      standId: stand.id,
      kind: FulfilmentOptionKind.STAND_IMMEDIATE,
    },
  });
  if (existing) return existing;

  return prisma.fulfilmentOption.create({
    data: {
      ownerId: stand.ownerId,
      standId: stand.id,
      kind: FulfilmentOptionKind.STAND_IMMEDIATE,
      label: stand.name,
      handoverMode: HandoverMode.COLLECT,
      paymentTiming: PaymentTiming.PAY_NOW,
      channels: ["STAND"],
      isActive: true,
      sortOrder: 0,
    },
  });
}

export async function ensureStandImmediateForOwner(ownerId: string) {
  const stands = await prisma.stand.findMany({
    where: { ownerId },
    select: { id: true, ownerId: true, name: true, locationLabel: true },
  });
  for (const stand of stands) {
    await ensureStandImmediateOption(stand);
  }
}
