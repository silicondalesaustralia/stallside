import { redirectWithinStorefront } from "@/lib/storefront/clean-redirect";

/** Old `/menu` → `/menus`. */
export default async function LegacyMenusRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug } = await params;
  return redirectWithinStorefront(slug, "/menus", (await searchParams).draft === "1");
}
