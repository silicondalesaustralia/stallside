import { redirectWithinStorefront } from "@/lib/storefront/clean-redirect";

/** Old `/shop/{category}` URLs → `/{category}`. */
export default async function LegacyCategoryRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug, categorySlug } = await params;
  const draft = (await searchParams).draft === "1";
  const key = decodeURIComponent(categorySlug).trim().toLowerCase();
  return redirectWithinStorefront(slug, `/${encodeURIComponent(key)}`, draft);
}
