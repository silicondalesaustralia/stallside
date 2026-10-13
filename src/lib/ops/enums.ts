/** Client-safe ops enums (no Prisma / Node imports). */

export type FulfilmentStatus =
  | "NEW"
  | "PREPARING"
  | "READY"
  | "COLLECTED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type CollectionStatus = "ORDERED" | "READY" | "COLLECTED";

export type HandoverMode = "COLLECT" | "DELIVER";

export const FulfilmentStatus = {
  NEW: "NEW",
  PREPARING: "PREPARING",
  READY: "READY",
  COLLECTED: "COLLECTED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const satisfies Record<string, FulfilmentStatus>;

export const HandoverMode = {
  COLLECT: "COLLECT",
  DELIVER: "DELIVER",
} as const satisfies Record<string, HandoverMode>;
