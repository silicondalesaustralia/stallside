function siteRoot(storefrontSlug: string, basePath?: string): string {
  return basePath !== undefined ? basePath : `/shop/${encodeURIComponent(storefrontSlug)}`;
}

/** Cart and checkout on the website: `/cart` (same address as the site, so it sees the cart). */
export function shopCartPath(storefrontSlug: string, draft = false, basePath?: string): string {
  const path = `${siteRoot(storefrontSlug, basePath)}/cart`;
  return draft ? `${path}?draft=1` : path;
}

/** Website "All products" page, used for continue-shopping links from the cart. */
export function shopAllProductsPath(storefrontSlug: string, draft = false, basePath?: string): string {
  const path = `${siteRoot(storefrontSlug, basePath)}/shop`;
  return draft ? `${path}?draft=1` : path;
}
