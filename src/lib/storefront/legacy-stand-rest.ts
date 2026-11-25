/**
 * Maps the rest of a legacy `/s/{stand}/…` path (after the stand slug) onto a
 * storefront path. Returns null when the path should stay on the farmstand
 * (pay / checkout / subscription manage). A lone segment is `{ product }` so
 * the caller can resolve the main category.
 */
export function mapLegacyStandRest(rest: string[]): string | null | { product: string } {
  const head = rest[0];
  if (!head) return "/";
  if (head === "pay" || head === "checkout") return null;
  if (head === "cart") return "/cart";
  if (head === "menu" || head === "menus") {
    return rest[1] ? `/menus/${encodeURIComponent(rest[1])}` : "/menus";
  }
  if (head === "pre") {
    return rest[1] ? `/pre-orders/${encodeURIComponent(rest[1])}` : "/pre-orders";
  }
  if (head === "sub") {
    if (rest[1] === "manage") return null;
    return rest[1] ? `/subscriptions/${encodeURIComponent(rest[1])}` : "/subscriptions";
  }
  if (head === "c" && rest[1]) return `/${encodeURIComponent(rest[1])}`;
  if (rest.length === 1) return { product: head };
  return `/${rest.map(encodeURIComponent).join("/")}`;
}
