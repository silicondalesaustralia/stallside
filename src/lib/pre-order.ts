/** Parse pre-order fields from product forms. Card-tier only. Client-safe (no Prisma). */

export type PaymentTimingValue =
  | "PAY_NOW"
  | "PAY_UPFRONT"
  | "DEPOSIT_THEN_BALANCE";

export type HandoverModeValue = "COLLECT" | "DELIVER";

export type PreOrderParsed =
  | {
      isPreOrder: false;
      orderByAt: null;
      collectionAt: null;
      collectionNote: null;
      showExactStock: false;
      paymentTiming: "PAY_NOW";
      depositPercent: null;
      handoverMode: "COLLECT";
    }
  | {
      isPreOrder: true;
      orderByAt: Date;
      collectionAt: Date;
      collectionNote: string | null;
      showExactStock: boolean;
      paymentTiming: "PAY_UPFRONT" | "DEPOSIT_THEN_BALANCE";
      depositPercent: number | null;
      handoverMode: HandoverModeValue;
    };

function parseDateTimeLocal(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // datetime-local has no zone - treat digits as wall-clock (not UTC via Date.parse).
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = match[6] ? Number(match[6]) : 0;
    const d = new Date(year, month, day, hour, minute, second);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** `datetime-local` value from a Date (local wall clock). */
export function toDateTimeLocalValue(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parsePreOrderFromForm(
  formData: FormData,
  cardTier: boolean,
  stripeConnected: boolean,
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
        depositPercent: null,
        handoverMode: "COLLECT",
      },
    };
  }
  void cardTier;
  if (!stripeConnected) {
    return {
      ok: false,
      error: "Connect Stripe before enabling pre-orders.",
    };
  }
  const orderByAt = parseDateTimeLocal(String(formData.get("orderByAt") ?? ""));
  const collectionAt = parseDateTimeLocal(
    String(formData.get("collectionAt") ?? ""),
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

  const depositMode =
    formData.get("depositRequired") === "on" ||
    formData.get("depositRequired") === "true" ||
    formData.get("paymentTiming") === "DEPOSIT_THEN_BALANCE";
  let depositPercent: number | null = null;
  let paymentTiming: "PAY_UPFRONT" | "DEPOSIT_THEN_BALANCE" = "PAY_UPFRONT";
  if (depositMode) {
    const pctRaw = Number(formData.get("depositPercent") ?? 30);
    if (!Number.isFinite(pctRaw) || pctRaw < 1 || pctRaw > 99) {
      return { ok: false, error: "Deposit percent must be between 1 and 99." };
    }
    depositPercent = Math.round(pctRaw);
    paymentTiming = "DEPOSIT_THEN_BALANCE";
  }

  const handoverRaw = String(formData.get("handoverMode") ?? "COLLECT");
  const handoverMode: HandoverModeValue =
    handoverRaw === "DELIVER" ? "DELIVER" : "COLLECT";

  return {
    ok: true,
    data: {
      isPreOrder: true,
      orderByAt,
      collectionAt,
      collectionNote: noteRaw ? noteRaw.slice(0, 200) : null,
      showExactStock,
      paymentTiming,
      depositPercent,
      handoverMode,
    },
  };
}

export function formatCollectionLabel(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatOrderByLabel(d: Date): string {
  return d.toLocaleString(undefined, {
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

/** Shown when cart mixes incompatible payment/handover settings. */
export const CART_MIX_PREORDER_SETTINGS =
  "Pre-order items in one checkout must share the same payment and delivery settings.";
