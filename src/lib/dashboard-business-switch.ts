/** Where to go after the header business picker changes. */
export function pathAfterBusinessSwitch(
  pathname: string,
  businessId: string,
): string {
  if (
    pathname.startsWith("/dashboard/pre-order-pages/") &&
    !pathname.startsWith("/dashboard/pre-order-pages/new")
  ) {
    return "/dashboard/pre-order-pages";
  }
  if (
    pathname.startsWith("/dashboard/products/") &&
    !pathname.startsWith("/dashboard/products/new")
  ) {
    return "/dashboard/products";
  }
  const businessRest = pathname.match(/^\/dashboard\/businesses\/[^/]+(.*)$/);
  if (businessRest) {
    return `/dashboard/businesses/${businessId}${businessRest[1] ?? ""}`;
  }
  return pathname;
}
