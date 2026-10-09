/**
 * Legacy public path redirects for the Option-1 URL map.
 * Returns a destination pathname + optional query (no origin).
 */
export function legacyStorefrontRedirect(
  pathname: string,
  search: string,
): string | null {
  const qs = search.startsWith("?") ? search.slice(1) : search.replace(/^\?/, "");
  const params = new URLSearchParams(qs);

  const nestedProduct = pathname.match(/^\/shop\/([^/]+)\/product\/([^/]+)\/?$/);
  if (nestedProduct) {
    const dest = `/shop/${nestedProduct[1]}/products/${nestedProduct[2]}`;
    const s = params.toString();
    return s ? `${dest}?${s}` : dest;
  }

  const rootProduct = pathname.match(/^\/product\/([^/]+)\/?$/);
  if (rootProduct) {
    const dest = `/products/${rootProduct[1]}`;
    const s = params.toString();
    return s ? `${dest}?${s}` : dest;
  }

  const cat = params.get("category")?.trim().toLowerCase();
  if (!cat) return null;
  params.delete("category");
  const s = params.toString();

  const nestedShop = pathname.match(/^\/shop\/([^/]+)\/shop\/?$/);
  if (nestedShop) {
    const dest = `/shop/${nestedShop[1]}/shop/${encodeURIComponent(cat)}`;
    return s ? `${dest}?${s}` : dest;
  }

  if (pathname === "/shop" || pathname === "/shop/") {
    const dest = `/shop/${encodeURIComponent(cat)}`;
    return s ? `${dest}?${s}` : dest;
  }

  return null;
}
