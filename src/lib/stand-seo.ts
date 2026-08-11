import type { Metadata } from "next";
import { isDemoStandSlug } from "@/lib/demo";
import { SITE_URL } from "@/lib/legal";

export function standCatalogPath(standSlug: string) {
  return `/s/${standSlug}`;
}

export function standProductPath(standSlug: string, productSlug: string) {
  return `/s/${standSlug}/${productSlug}`;
}

export function standCartPath(standSlug: string) {
  return `/s/${standSlug}/cart`;
}

export function standPreOrderPagePath(standSlug: string, pageSlug: string) {
  return `/s/${standSlug}/pre/${pageSlug}`;
}

export function catalogMetadata(input: {
  standName: string;
  standSlug: string;
  locationLabel?: string | null;
  logoUrl?: string | null;
}): Metadata {
  const title = `${input.standName} · Vendl`;
  const description = input.locationLabel
    ? `Shop ${input.standName} at ${input.locationLabel}. Browse and pay at the stall.`
    : `Shop ${input.standName}. Browse and pay at the stall.`;
  const canonical = `${SITE_URL}${standCatalogPath(input.standSlug)}`;
  const demo = isDemoStandSlug(input.standSlug);

  return {
    title,
    description,
    alternates: { canonical },
    robots: demo ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      ...(input.logoUrl ? { images: [{ url: input.logoUrl }] } : {}),
    },
  };
}

export function productMetadata(input: {
  standName: string;
  standSlug: string;
  productName: string;
  productSlug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isPreOrder?: boolean;
  collectionNote?: string | null;
}): Metadata {
  const title =
    input.seoTitle?.trim() ||
    `${input.productName} · ${input.standName}`;
  const description =
    input.seoDescription?.trim() ||
    input.description?.trim() ||
    input.collectionNote?.trim() ||
    (input.isPreOrder
      ? `Pre-order ${input.productName} from ${input.standName}.`
      : `Buy ${input.productName} from ${input.standName}.`);
  const canonical = `${SITE_URL}${standProductPath(input.standSlug, input.productSlug)}`;
  const demo = isDemoStandSlug(input.standSlug);

  return {
    title,
    description,
    alternates: { canonical },
    robots: demo ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      ...(input.imageUrl ? { images: [{ url: input.imageUrl }] } : {}),
    },
  };
}
