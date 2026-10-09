import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import type { PublicProductCard } from "@/lib/public-product";
import type { StorefrontBlogPost } from "@/lib/studio/blog";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { breadcrumbListSchema } from "./breadcrumbs";

export function storefrontSchemaGraph(input: {
  slug: string;
  branding: ResolvedStorefrontBranding;
  pageUrl: string;
  breadcrumbSegments?: { label: string; path?: string }[];
  primaryCustomHostname?: string | null;
  extra?: Record<string, unknown>[];
}) {
  const homeUrl = storefrontPublicUrl(input.slug, {
    primaryCustomHostname: input.primaryCustomHostname,
  });
  const orgId = `${homeUrl}#organization`;
  const websiteId = `${homeUrl}#website`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": orgId,
      name: input.branding.headline,
      url: homeUrl,
      ...(input.branding.logoUrl ? { logo: input.branding.logoUrl } : {}),
      ...(input.branding.contactEmail
        ? { email: input.branding.contactEmail }
        : {}),
      ...(input.branding.regionLabel
        ? {
            address: {
              "@type": "PostalAddress",
              addressLocality: input.branding.regionLabel,
            },
          }
        : {}),
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: homeUrl,
      name: input.branding.headline,
      publisher: { "@id": orgId },
    },
  ];

  if (input.breadcrumbSegments?.length) {
    graph.push(
      breadcrumbListSchema(
        input.slug,
        input.breadcrumbSegments,
        input.pageUrl,
        input.primaryCustomHostname,
      ),
    );
  }

  if (input.extra?.length) {
    graph.push(...input.extra);
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function productSchemaNode(input: {
  slug: string;
  product: PublicProductCard;
  currency: string;
  pageUrl: string;
  branding: ResolvedStorefrontBranding;
}) {
  return {
    "@type": "Product",
    "@id": `${input.pageUrl}#product`,
    name: input.product.name,
    description: input.product.description ?? undefined,
    image: input.product.imageUrl ?? undefined,
    url: input.pageUrl,
    brand: { "@type": "Brand", name: input.branding.headline },
    offers: {
      "@type": "Offer",
      url: input.pageUrl,
      priceCurrency: input.currency,
      price: (input.product.priceCents / 100).toFixed(2),
      availability: input.product.soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };
}

export function articleSchemaNode(input: {
  post: StorefrontBlogPost;
  pageUrl: string;
  branding: ResolvedStorefrontBranding;
}) {
  return {
    "@type": "Article",
    "@id": `${input.pageUrl}#article`,
    headline: input.post.title,
    description: input.post.excerpt ?? undefined,
    datePublished: input.post.publishedAt ?? input.post.updatedAt,
    dateModified: input.post.updatedAt,
    image: input.post.featuredImageUrl ?? undefined,
    author: { "@type": "Organization", name: input.branding.headline },
    publisher: { "@type": "Organization", name: input.branding.headline },
    mainEntityOfPage: { "@id": input.pageUrl },
  };
}
