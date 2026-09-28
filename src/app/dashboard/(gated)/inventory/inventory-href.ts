export type InventoryParams = {
  status?: string;
  q?: string;
  mode?: string;
};

export function inventoryQuery(params: InventoryParams): string {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  if (params.mode === "count") search.set("mode", "count");
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function inventoryHref(params: InventoryParams): string {
  return `/dashboard/inventory${inventoryQuery(params)}`;
}

export const pillClass = (active: boolean) =>
  `rounded-full px-3.5 py-1.5 text-sm font-semibold ${
    active
      ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
      : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
  }`;
