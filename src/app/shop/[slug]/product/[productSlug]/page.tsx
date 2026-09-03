import { permanentRedirect } from "next/navigation";

/** Legacy singular /product → plural /products. */
export default async function LegacyStorefrontProductRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug, productSlug } = await params;
  const sp = await searchParams;
  const qs = sp.draft === "1" ? "?draft=1" : "";
  permanentRedirect(
    `/shop/${encodeURIComponent(slug)}/products/${encodeURIComponent(productSlug)}${qs}`,
  );
}
