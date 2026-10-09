import type { Metadata } from "next";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";

export function storefrontMetadata(input: {
  branding: ResolvedStorefrontBranding;
  slug: string;
  published: boolean;
  pageTitle?: string;
  description?: string;
  imageUrl?: string | null;
  path?: string;
  primaryCustomHostname?: string | null;
}): Metadata {
  const title = input.pageTitle
    ? `${input.pageTitle} · ${input.branding.headline}`
    : input.branding.headline;

  const description =
    input.description ??
    input.branding.subheadline ??
    input.branding.about ??
    `Shop ${input.branding.headline} online.`;

  const canonical = storefrontPublicUrl(input.slug, {
    path: input.path,
    primaryCustomHostname: input.primaryCustomHostname,
  });
  const ogImage = input.imageUrl ?? input.branding.heroImageUrl ?? input.branding.logoUrl;

  return {
    title,
    description,
    alternates: { canonical },
    robots: input.published
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: input.branding.headline,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}
