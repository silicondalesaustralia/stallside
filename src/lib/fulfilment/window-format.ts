import {
  FulfilmentOptionKind,
  FulfilmentStatus,
  HandoverMode,
  PickupWindowRecurrence,
} from "@/generated/prisma/client";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function formatTimeMin(min: number | null | undefined): string {
  if (min == null) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12}${ampm}` : `${hour12}:${String(m).padStart(2, "0")}${ampm}`;
}

export function formatPickupWindowLabel(input: {
  recurrence: PickupWindowRecurrence;
  label?: string | null;
  weekday?: number | null;
  startTimeMin?: number | null;
  endTimeMin?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
}): string {
  if (input.label?.trim()) return input.label.trim();
  if (
    input.recurrence === PickupWindowRecurrence.WEEKLY &&
    input.weekday != null
  ) {
    const day = WEEKDAYS[input.weekday] ?? "Day";
    const start = formatTimeMin(input.startTimeMin);
    const end = formatTimeMin(input.endTimeMin);
    if (start && end) return `${day} ${start}–${end}`;
    return day;
  }
  if (input.startsAt) {
    return input.startsAt.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return "Pickup window";
}

export function collectionStatusToFulfilmentStatus(
  status: string | null | undefined,
): FulfilmentStatus {
  switch (status) {
    case "READY":
      return FulfilmentStatus.READY;
    case "COLLECTED":
      return FulfilmentStatus.COLLECTED;
    case "ORDERED":
    default:
      return FulfilmentStatus.NEW;
  }
}

export function fulfilmentKindLabel(kind: FulfilmentOptionKind): string {
  switch (kind) {
    case FulfilmentOptionKind.STAND_IMMEDIATE:
      return "Farm stand";
    case FulfilmentOptionKind.PICKUP:
      return "Pickup";
    case FulfilmentOptionKind.DELIVERY:
      return "Delivery";
    case FulfilmentOptionKind.PREORDER_SHEET:
      return "Pre-order";
    case FulfilmentOptionKind.MENU_SHEET:
      return "Menu";
    case FulfilmentOptionKind.SUBSCRIPTION:
      return "Subscription";
    default:
      return "Fulfilment";
  }
}

export function handoverModeFromKind(
  kind: FulfilmentOptionKind,
  handoverMode: HandoverMode,
): HandoverMode {
  if (kind === FulfilmentOptionKind.DELIVERY) return HandoverMode.DELIVER;
  return handoverMode;
}
