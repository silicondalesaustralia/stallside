import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { mapPublicProduct } from "@/lib/public-product";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { standPreOrdersPath } from "@/lib/stand-seo";
import { productLiveWhere } from "@/lib/product-visibility";
import StandStoreHeader from "../../StandStoreHeader";
import StandGoToCartBar from "../../StandGoToCartBar";
import PreOrderPageContent from "./PreOrderPageContent";
import { preOrderDetailMetadata } from "./pre-order-detail-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ standSlug: string; pageSlug: string }>;
}): Promise<Metadata> {
  const { standSlug, pageSlug } = await params;
  return preOrderDetailMetadata(standSlug, pageSlug);
}

export default async function PublicPreOrderPage({
  params,
}: {
  params: Promise<{ standSlug: string; pageSlug: string }>;
}) {
  const { standSlug, pageSlug } = await params;
  const standKey = decodeURIComponent(standSlug).trim().toLowerCase();
  const pageKey = decodeURIComponent(pageSlug).trim().toLowerCase();

  const stand = await prisma.stand.findUnique({
    where: { slug: standKey },
    include: {
      owner: true,
      products: {
        where: productLiveWhere,
        include: {
          optionGroups: {
            orderBy: { sortOrder: "asc" },
            include: { choices: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });
  if (!stand || !stand.isActive) notFound();

  const page = await prisma.preOrderPage.findFirst({
    where: {
      standId: stand.id,
      slug: pageKey,
      isActive: true,
    },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: { product: true },
      },
    },
  });
  if (!page) notFound();

  const branded = publicStandBranding(stand, stand.owner);
  const byId = new Map(
    stand.products.map((p) => [
      p.id,
      mapPublicProduct(p, {
        showExactStock: stand.showExactStock || page.showExactStock,
        showPublicScarcity: stand.showPublicScarcity,
        timeZone: stand.timezone,
      }),
    ]),
  );
  const pageProducts = page.items
    .map((i) => byId.get(i.productId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (pageProducts.length === 0) notFound();

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-24 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
        locationLabel={stand.locationLabel}
        backHref={standPreOrdersPath(stand.slug)}
        backLabel="← All pre-orders"
      />
      {page.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.imageUrl}
          alt=""
          className="mt-6 aspect-[1.91/1] w-full rounded-[var(--radius)] object-cover"
        />
      ) : null}
      <div className="mt-6">
        <PreOrderPageContent
          standSlug={stand.slug}
          standName={stand.name}
          timezone={stand.timezone}
          currency={stand.currency}
          accentColor={branded.accentColor}
          page={{
            slug: page.slug,
            title: page.title,
            description: page.description,
            collectionAt: page.collectionAt,
            orderByAt: page.orderByAt,
            collectionNote: page.collectionNote,
            handoverMode: page.handoverMode,
          }}
          pageProducts={pageProducts}
          catalogProducts={[...byId.values()]}
        />
      </div>
      <StandGoToCartBar standSlug={stand.slug} />
    </main>
  );
}
