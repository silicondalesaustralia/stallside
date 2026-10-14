import { redirectWithinStorefront } from "@/lib/storefront/clean-redirect";

/** Old `/pages/{page}` URLs → `/{page}` (built-in pages already live at `/{key}`). */
export default async function LegacyCustomPageRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug, pageSlug } = await params;
  const draft = (await searchParams).draft === "1";
  const key = decodeURIComponent(pageSlug).trim().toLowerCase();
  return redirectWithinStorefront(slug, `/${encodeURIComponent(key)}`, draft);
}
