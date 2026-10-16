export const QR_TARGET_KINDS = ["home", "page", "shop", "category", "product", "menu", "preorder_page", "cart"] as const;
export type QrTargetKind = (typeof QR_TARGET_KINDS)[number];

export type QrTarget = { kind: QrTargetKind; id: string | null };

export const QR_TARGET_GROUPS = ["Website pages", "Shop", "Products", "Menus & pre-orders"] as const;
export type QrTargetGroup = (typeof QR_TARGET_GROUPS)[number];

export type QrTargetOption = QrTarget & { label: string; group: QrTargetGroup; path: string };

const NEEDS_ID: ReadonlySet<QrTargetKind> = new Set(["page", "category", "product", "menu", "preorder_page"]);

function isKind(value: unknown): value is QrTargetKind {
  return typeof value === "string" && (QR_TARGET_KINDS as readonly string[]).includes(value);
}

/** A valid target, or null when the kind is unknown or its id is missing. */
export function parseQrTarget(kind: unknown, id: unknown): QrTarget | null {
  if (!isKind(kind)) return null;
  if (!NEEDS_ID.has(kind)) return { kind, id: null };
  return typeof id === "string" && id.trim() ? { kind, id: id.trim() } : null;
}

/** Rows saved before page targets: whole website or one category. */
export function legacyQrTarget(linkMode: string, categoryId: string | null): QrTarget {
  return linkMode === "WEBSITE_CATEGORY" && categoryId ? { kind: "category", id: categoryId } : { kind: "home", id: null };
}

export function qrTargetKey(target: QrTarget): string {
  return `${target.kind}:${target.id ?? ""}`;
}

/** Adds the at-the-stall marker the storefront checkout reads. */
export function withStallFlag(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}at=stall`;
}
