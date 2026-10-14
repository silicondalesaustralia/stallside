import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { subscriptionsIndexMetadata } from "@/lib/stand-seo";
import SubscriptionsIndexView from "./SubscriptionsIndexView";
import { redirectLegacyStandToWebsite } from "@/lib/storefront/legacy-stand-redirect";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}): Promise<Metadata> {
  const { standSlug } = await params;
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await prisma.stand.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      logoUrl: true,
      ogImageUrl: true,
      isActive: true,
    },
  });
  if (!stand || !stand.isActive) return { title: "Memberships" };
  return subscriptionsIndexMetadata({
    standName: stand.name,
    standSlug: stand.slug,
    logoUrl: stand.logoUrl,
    ogImageUrl: stand.ogImageUrl,
  });
}

export default async function PublicSubscriptionsIndexPage({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}) {
  const { standSlug } = await params;
  await redirectLegacyStandToWebsite(standSlug, { kind: "subscriptions" });
  return <SubscriptionsIndexView standSlug={standSlug} />;
}
