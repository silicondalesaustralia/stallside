import { standPathFromFarmstand } from "@/lib/farmstand/paths";

export type StandStoreLinkKey = "shop" | "pre" | "sub";

/** Which header section a public stand path belongs to (`/s/…` or its farmstand form). */
export function activeStoreSection(
  pathname: string,
  standSlug: string,
): StandStoreLinkKey | null {
  const path = standPathFromFarmstand(pathname, standSlug);
  const base = `/s/${standSlug}`;
  if (path !== base && !path.startsWith(`${base}/`)) return null;
  const segment = path.slice(base.length).split("/")[1] ?? "";
  if (segment === "pre") return "pre";
  if (segment === "sub") return "sub";
  if (segment === "cart" || segment === "pay") return null;
  return "shop";
}

/** Category slug when on /s/{stand}/c/{category}. */
export function activeCategorySlug(pathname: string, standSlug: string): string | null {
  const path = standPathFromFarmstand(pathname, standSlug);
  const prefix = `/s/${standSlug}/c/`;
  if (!path.startsWith(prefix)) return null;
  return decodeURIComponent(path.slice(prefix.length).split("/")[0] ?? "") || null;
}
