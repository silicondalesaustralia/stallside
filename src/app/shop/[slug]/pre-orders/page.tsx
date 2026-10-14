import { redirectWithinStorefront } from "@/lib/storefront/clean-redirect";

/** Pre-orders are listed with the menus. */
export default async function PreOrdersIndexRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug } = await params;
  return redirectWithinStorefront(slug, "/menus", (await searchParams).draft === "1");
}
