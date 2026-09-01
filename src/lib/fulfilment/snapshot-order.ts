import { prisma } from "@/lib/prisma";
import {
  CollectionStatus,
  FulfilmentOptionKind,
  FulfilmentStatus,
  HandoverMode,
  type PaymentTiming,
} from "@/generated/prisma/client";
import { formatPickupWindowLabel } from "@/lib/fulfilment/window-format";
import {
  collectionStatusToFulfilmentStatus,
  fulfilmentKindLabel,
} from "@/lib/fulfilment/window-format";
import { ensureStandImmediateOption } from "@/lib/fulfilment/defaults";

type SnapshotInput = {
  orderId: string;
  standId: string;
  ownerId: string;
  isPreOrder: boolean;
  collectionAt?: Date | null;
  collectionNote?: string | null;
  handoverMode: HandoverMode;
  collectionStatus?: string | null;
  fulfilmentOptionId?: string | null;
};

function formatAddress(parts: (string | null | undefined)[]): string | null {
  const line = parts.filter(Boolean).join(", ");
  return line || null;
}

export async function snapshotOrderFulfilment(input: SnapshotInput) {
  let option = input.fulfilmentOptionId
    ? await prisma.fulfilmentOption.findUnique({
        where: { id: input.fulfilmentOptionId },
        include: {
          pickupLocation: true,
          pickupWindow: true,
          deliveryZone: true,
        },
      })
    : null;

  if (!option && !input.isPreOrder) {
    const stand = await prisma.stand.findUnique({
      where: { id: input.standId },
      select: { id: true, ownerId: true, name: true, locationLabel: true },
    });
    if (stand) {
      const immediate = await ensureStandImmediateOption(stand);
      option = await prisma.fulfilmentOption.findUnique({
        where: { id: immediate.id },
        include: {
          pickupLocation: true,
          pickupWindow: true,
          deliveryZone: true,
        },
      });
    }
  }

  const kind =
    option?.kind ??
    (input.isPreOrder
      ? FulfilmentOptionKind.PREORDER_SHEET
      : FulfilmentOptionKind.STAND_IMMEDIATE);

  const loc = option?.pickupLocation;
  const win = option?.pickupWindow;
  const zone = option?.deliveryZone;

  const windowLabel = win
    ? formatPickupWindowLabel(win)
    : input.collectionAt
      ? input.collectionAt.toLocaleString(undefined, {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

  const optionLabel =
    option?.label ??
    (kind === FulfilmentOptionKind.STAND_IMMEDIATE
      ? "Farm stand"
      : fulfilmentKindLabel(kind));

  const handoverMode =
    kind === FulfilmentOptionKind.DELIVERY
      ? HandoverMode.DELIVER
      : input.handoverMode;

  const fulfilmentStatus = input.isPreOrder
    ? collectionStatusToFulfilmentStatus(input.collectionStatus)
    : FulfilmentStatus.COLLECTED;

  await prisma.orderFulfilment.create({
    data: {
      orderId: input.orderId,
      fulfilmentOptionId: option?.id ?? null,
      kind,
      optionLabel,
      pickupLocationName: loc?.name ?? null,
      pickupPublicLabel: loc?.publicLabel ?? null,
      pickupAddressSnapshot: loc
        ? formatAddress([
            loc.addressLine1,
            loc.suburb,
            loc.stateTerritory,
            loc.postcode,
          ])
        : null,
      pickupInstructions: loc?.publicInstructions ?? input.collectionNote,
      pickupPrivateInstructions: loc?.privateInstructions ?? null,
      windowLabel,
      collectionStartsAt: input.collectionAt ?? win?.startsAt ?? null,
      collectionEndsAt: win?.endsAt ?? null,
      deliveryZoneName: zone?.name ?? null,
      deliveryFeeCents: zone?.deliveryFeeCents ?? option?.feeCents ?? 0,
      handoverMode,
      fulfilmentStatus,
    },
  });
}

export async function snapshotFromLegacyPreOrder(input: {
  orderId: string;
  standId: string;
  ownerId: string;
  collectionAt: Date;
  collectionNote?: string | null;
  handoverMode: HandoverMode;
  paymentTiming: PaymentTiming;
}) {
  return snapshotOrderFulfilment({
    orderId: input.orderId,
    standId: input.standId,
    ownerId: input.ownerId,
    isPreOrder: true,
    collectionAt: input.collectionAt,
    collectionNote: input.collectionNote,
    handoverMode: input.handoverMode,
    collectionStatus: "ORDERED",
  });
}
