export type StandStoreLinkKey = "shop" | "pre" | "sub";

/** Which header section a public stand path belongs to. */
export function activeStoreSection(
  pathname: string,
  standSlug: string,
): StandStoreLinkKey | null {
  const base = `/s/${standSlug}`;
  if (pathname !== base && !pathname.startsWith(`${base}/`)) return null;
  const segment = pathname.slice(base.length).split("/")[1] ?? "";
  if (segment === "pre") return "pre";
  if (segment === "sub") return "sub";
  if (segment === "cart" || segment === "pay") return null;
  return "shop";
}

/** Category slug when on /s/{stand}/c/{category}. */
export function activeCategorySlug(pathname: string, standSlug: string): string | null {
  const prefix = `/s/${standSlug}/c/`;
  if (!pathname.startsWith(prefix)) return null;
  return decodeURIComponent(pathname.slice(prefix.length).split("/")[0] ?? "") || null;
}
