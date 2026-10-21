import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  standPreOrdersPath,
  standSectionMetadata,
} from "@/lib/stand-seo";
import PreOrdersIndexView from "./PreOrdersIndexView";
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
  if (!stand || !stand.isActive) return { title: "Pre-orders" };
  return standSectionMetadata({
    standName: stand.name,
    standSlug: stand.slug,
    sectionTitle: "Pre-orders",
    description: `Pre-orders from ${stand.name}.`,
    path: standPreOrdersPath(stand.slug),
    logoUrl: stand.logoUrl,
    ogImageUrl: stand.ogImageUrl,
  });
}

export default async function PublicPreOrdersIndexPage({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}) {
  const { standSlug } = await params;
  await redirectLegacyStandToWebsite(standSlug, { kind: "preOrders" });
  return <PreOrdersIndexView standSlug={standSlug} />;
}
