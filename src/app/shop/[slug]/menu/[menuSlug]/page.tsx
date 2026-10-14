import { redirectWithinStorefront } from "@/lib/storefront/clean-redirect";

/** Old `/menu/{menu}` → `/menus/{menu}` (which forwards pre-order drops to `/pre-orders/{menu}`). */
export default async function LegacyMenuRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; menuSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug, menuSlug } = await params;
  const key = decodeURIComponent(menuSlug).trim().toLowerCase();
  return redirectWithinStorefront(slug, `/menus/${encodeURIComponent(key)}`, (await searchParams).draft === "1");
}
