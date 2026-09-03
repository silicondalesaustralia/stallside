import type {
  CollectionStatus,
  FulfilmentStatus,
  HandoverMode,
} from "@/lib/ops/enums";
import { FulfilmentStatus as FS, HandoverMode as HM } from "@/lib/ops/enums";

/** Seller-facing ops labels (internal enums stay technical). */
export const OPS_STATUS_LABEL: Record<FulfilmentStatus, string> = {
  NEW: "To prepare",
  PREPARING: "Preparing",
  READY: "Ready",
  COLLECTED: "Collected",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ALLOWED: Partial<Record<FulfilmentStatus, FulfilmentStatus[]>> = {
  NEW: [FS.PREPARING, FS.READY, FS.CANCELLED],
  PREPARING: [FS.READY, FS.NEW, FS.CANCELLED],
  READY: [FS.COLLECTED, FS.OUT_FOR_DELIVERY, FS.PREPARING, FS.CANCELLED],
  OUT_FOR_DELIVERY: [FS.DELIVERED, FS.READY, FS.CANCELLED],
  COLLECTED: [],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransitionOps(
  from: FulfilmentStatus,
  to: FulfilmentStatus,
): boolean {
  if (from === to) return true;
  return (ALLOWED[from] ?? []).includes(to);
}

/** Map fulfilment status → legacy collection status for Collections UI. */
export function fulfilmentToCollectionStatus(
  status: FulfilmentStatus,
): CollectionStatus | null {
  switch (status) {
    case FS.READY:
    case FS.OUT_FOR_DELIVERY:
      return "READY";
    case FS.COLLECTED:
    case FS.DELIVERED:
      return "COLLECTED";
    case FS.CANCELLED:
      return null;
    case FS.NEW:
    case FS.PREPARING:
    default:
      return "ORDERED";
  }
}

export function collectionToFulfilmentStatus(
  status: CollectionStatus | null | undefined,
): FulfilmentStatus {
  switch (status) {
    case "READY":
      return FS.READY;
    case "COLLECTED":
      return FS.COLLECTED;
    case "ORDERED":
    default:
      return FS.NEW;
  }
}

export function nextHandoverStatus(
  current: FulfilmentStatus,
  handoverMode: HandoverMode,
): FulfilmentStatus | null {
  if (handoverMode === HM.DELIVER) {
    if (current === FS.READY) return FS.OUT_FOR_DELIVERY;
    if (current === FS.OUT_FOR_DELIVERY) return FS.DELIVERED;
  } else if (current === FS.READY) {
    return FS.COLLECTED;
  }
  return null;
}
