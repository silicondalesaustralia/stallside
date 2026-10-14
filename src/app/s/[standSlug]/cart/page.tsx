import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { standAccentStyle } from "@/lib/stand-brand";
import {
  standCartPath,
  standCatalogPath,
  standSectionMetadata,
} from "@/lib/stand-seo";
import { loadStandCartData } from "@/lib/storefront/stand-cart-props";
import { redirectLegacyStandToWebsite } from "@/lib/storefront/legacy-stand-redirect";
import StandCartCheckout from "../StandCartCheckout";
import StandStoreHeader from "../StandStoreHeader";

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
  if (!stand || !stand.isActive) {
    return { title: "Cart", robots: { index: false, follow: false } };
  }
  return standSectionMetadata({
    standName: stand.name,
    standSlug: stand.slug,
    sectionTitle: "Cart",
    description: `Cart for ${stand.name}.`,
    path: standCartPath(stand.slug),
    logoUrl: stand.logoUrl,
    ogImageUrl: stand.ogImageUrl,
    noIndex: true,
  });
}

export default async function StandCartPage({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}) {
  const { standSlug } = await params;
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const data = await loadStandCartData(slug);
  if (!data) notFound();
  const { stand, props } = data;
  if (stand.cartMode === "CUSTOMER_CHOICE") {
    redirect(`${standCatalogPath(stand.slug)}/pay`);
  }
  await redirectLegacyStandToWebsite(stand.slug, { kind: "cart" });

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-8 pt-8"
      style={standAccentStyle(stand.accentColor, stand.secondaryColor)}
    >
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={stand.logoUrl}
        backHref={standCatalogPath(stand.slug)}
        backLabel="← Continue shopping"
      />
      <h2 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold">
        Your cart
      </h2>
      <StandCartCheckout {...props} />
    </main>
  );
}
