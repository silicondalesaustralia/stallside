/** Parse pre-order fields from product forms. Client-safe (no Prisma). */

import {
  DEFAULT_TIMEZONE,
  formatDateInTz,
  toDateTimeLocalInTz,
  zonedWallClockToUtc,
} from "@/lib/stand-timezone";
import { depositPercentOf, payOptionsError, payOptionsFromForm } from "@/lib/pre-order-pay-options";

export type PaymentTimingValue =
  | "PAY_NOW"
  | "PAY_UPFRONT"
  | "DEPOSIT_THEN_BALANCE"
  | "PAY_AT_PICKUP";

export type PreOrderPaymentTiming = Exclude<PaymentTimingValue, "PAY_NOW">;

export type HandoverModeValue = "COLLECT" | "DELIVER";

export type PreOrderParsed =
  | {
      isPreOrder: false;
      orderByAt: null;
      collectionAt: null;
      collectionNote: null;
      showExactStock: false;
      paymentTiming: "PAY_NOW";
      paymentOptions: [];
      depositPercent: null;
      handoverMode: "COLLECT";
    }
  | {
      isPreOrder: true;
      orderByAt: Date;
      collectionAt: Date;
      collectionNote: string | null;
      showExactStock: boolean;
      /** Default option (first of `paymentOptions`). */
      paymentTiming: PreOrderPaymentTiming;
      paymentOptions: PreOrderPaymentTiming[];
      depositPercent: number | null;
      handoverMode: HandoverModeValue;
    };

function parseDateTimeLocal(raw: string, timeZone: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // datetime-local has no zone — digits are wall clock in the stand timezone.
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = match[6] ? Number(match[6]) : 0;
    const d = zonedWallClockToUtc(
      year,
      month,
      day,
      hour,
      minute,
      second,
      timeZone,
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** `datetime-local` value in the stand timezone (not the server/browser TZ). */
export function toDateTimeLocalValue(
  d: Date | string,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  return toDateTimeLocalInTz(d, timeZone);
}

export function parsePreOrderFromForm(
  formData: FormData,
  cardTier: boolean,
  stripeConnected: boolean,
  timeZone: string = DEFAULT_TIMEZONE,
): { ok: true; data: PreOrderParsed } | { ok: false; error: string } {
  const flagged =
    formData.get("isPreOrder") === "on" ||
    formData.get("isPreOrder") === "true";
  if (!flagged) {
    return {
      ok: true,
      data: {
        isPreOrder: false,
        orderByAt: null,
        collectionAt: null,
        collectionNote: null,
        showExactStock: false,
        paymentTiming: "PAY_NOW",
        paymentOptions: [],
        depositPercent: null,
        handoverMode: "COLLECT",
      },
    };
  }
  void cardTier;
  const handoverRaw = String(formData.get("handoverMode") ?? "COLLECT");
  const handoverMode: HandoverModeValue =
    handoverRaw === "DELIVER" ? "DELIVER" : "COLLECT";
  const paymentOptions = payOptionsFromForm(formData);
  const optionsError = payOptionsError({
    options: paymentOptions,
    handoverMode,
    cardAllowed: stripeConnected,
  });
  if (optionsError) return { ok: false, error: optionsError };
  const orderByAt = parseDateTimeLocal(
    String(formData.get("orderByAt") ?? ""),
    timeZone,
  );
  const collectionAt = parseDateTimeLocal(
    String(formData.get("collectionAt") ?? ""),
    timeZone,
  );
  if (!orderByAt || !collectionAt) {
    return { ok: false, error: "Set order-by and collection times." };
  }
  if (collectionAt.getTime() <= orderByAt.getTime()) {
    return {
      ok: false,
      error:
        "Collection must be after the orders-close time (same day is fine if the time is later).",
    };
  }
  const noteRaw = String(formData.get("collectionNote") ?? "").trim();
  const showExactStock =
    formData.get("preOrderShowExactStock") === "on" ||
    formData.get("preOrderShowExactStock") === "true";

  let depositPercent: number | null = null;
  if (paymentOptions.includes("DEPOSIT_THEN_BALANCE")) {
    const pct = depositPercentOf(Number(formData.get("depositPercent") ?? 30));
    if (!pct.ok) return { ok: false, error: pct.error };
    depositPercent = pct.value;
  }

  return {
    ok: true,
    data: {
      isPreOrder: true,
      orderByAt,
      collectionAt,
      collectionNote: noteRaw ? noteRaw.slice(0, 200) : null,
      showExactStock,
      paymentTiming: paymentOptions[0],
      paymentOptions,
      depositPercent,
      handoverMode,
    },
  };
}

export function formatCollectionLabel(
  d: Date,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  return formatDateInTz(d, timeZone, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatOrderByLabel(
  d: Date,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  return formatDateInTz(d, timeZone, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Shown when cart mixes take-now and pre-order products. */
export const CART_MIX_TAKE_NOW_PREORDER =
  "You need to checkout these items separately as some are pre-order and some are take now.";

/** Shown when cart mixes pre-orders with different collection days. */
export const CART_MIX_COLLECTION_DAYS =
  "Pre-order items in one checkout must share the same collection day.";

/** Shown if a pay-at-pickup cart reaches an online payment rail. */
export const PAY_AT_PICKUP_CART_ERROR =
  "These pre-orders are paid at pickup. Place the order without paying online.";

/** Shown when cart mixes incompatible payment/handover settings. */
export const CART_MIX_PREORDER_SETTINGS =
  "Pre-order items in one checkout must share the same payment and delivery settings.";
