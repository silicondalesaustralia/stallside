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

function pageMeta(input: {
  title: string;
  description: string;
  canonical: string;
  standSlug: string;
  siteName?: string;
  image?: string | null;
}): Metadata {
  const demo = isDemoStandSlug(input.standSlug);
  const image = input.image || null;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.canonical },
    robots: demo ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.canonical,
      type: "website",
      ...(input.siteName ? { siteName: input.siteName } : {}),
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function catalogMetadata(input: {
  standName: string;
  standSlug: string;
  locationLabel?: string | null;
  logoUrl?: string | null;
  ogImageUrl?: string | null;
}): Metadata {
  return pageMeta({
    title: `${input.standName} · Vendl`,
    description: input.locationLabel
      ? `Shop ${input.standName} at ${input.locationLabel}. Browse and pay at the stall.`
      : `Shop ${input.standName}. Browse and pay at the stall.`,
    canonical: `${SITE_URL}${standCatalogPath(input.standSlug)}`,
    standSlug: input.standSlug,
    siteName: input.standName,
    image: input.ogImageUrl || input.logoUrl,
  });
}

export function subscriptionsIndexMetadata(input: {
  standName: string;
  standSlug: string;
  logoUrl?: string | null;
  ogImageUrl?: string | null;
}): Metadata {
  return pageMeta({
    title: `Memberships · ${input.standName}`,
    description: `Memberships and subscriptions from ${input.standName}.`,
    canonical: `${SITE_URL}${standSubscriptionsPath(input.standSlug)}`,
    standSlug: input.standSlug,
    siteName: input.standName,
    image: input.ogImageUrl || input.logoUrl,
  });
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
  return pageMeta({
    title: `${input.pageTitle} · ${input.standName}`,
    description:
      input.description?.trim() ||
      (input.collectionLabel
        ? `Pre-order for ${input.collectionLabel} from ${input.standName}.`
        : `Pre-order from ${input.standName}.`),
    canonical: `${SITE_URL}${standPreOrderPagePath(input.standSlug, input.pageSlug)}`,
    standSlug: input.standSlug,
    siteName: input.standName,
    image: input.imageUrl,
  });
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
  return pageMeta({
    title:
      input.seoTitle?.trim() || `${input.productName} · ${input.standName}`,
    description:
      input.seoDescription?.trim() ||
      input.description?.trim() ||
      input.collectionNote?.trim() ||
      (input.isPreOrder
        ? `Pre-order ${input.productName} from ${input.standName}.`
        : `Buy ${input.productName} from ${input.standName}.`),
    canonical: `${SITE_URL}${standProductPath(input.standSlug, input.productSlug)}`,
    standSlug: input.standSlug,
    siteName: input.standName,
    image: input.imageUrl,
  });
}
