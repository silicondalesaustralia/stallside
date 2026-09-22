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

export function standMenusPath(standSlug: string) {
  return `/s/${standSlug}/menu`;
}

export function standMenuDetailPath(standSlug: string, menuSlug: string) {
  return `/s/${standSlug}/menu/${menuSlug}`;
}

export function standPreOrdersPath(standSlug: string) {
  return `/s/${standSlug}/pre`;
}

export function standSubscriptionsPath(standSlug: string) {
  return `/s/${standSlug}/sub`;
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

export function preOrderPageMetadata(input: {
  standName: string;
  standSlug: string;
  pageTitle: string;
  pageSlug: string;
  description?: string | null;
  imageUrl?: string | null;
  collectionLabel?: string | null;
}): Metadata {
  const title = `${input.pageTitle} · ${input.standName}`;
  const description =
    input.description?.trim() ||
    (input.collectionLabel
      ? `Pre-order for ${input.collectionLabel} from ${input.standName}.`
      : `Pre-order from ${input.standName}.`);
  const canonical = `${SITE_URL}${standPreOrderPagePath(input.standSlug, input.pageSlug)}`;
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
    twitter: {
      card: input.imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(input.imageUrl ? { images: [input.imageUrl] } : {}),
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
