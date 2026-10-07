import type { PublicProductCard } from "@/lib/public-product";
import {
  formatPreorderCollectionDate,
  preorderHandoverHeading,
} from "@/lib/preorder-category-copy";
import {
  preorderAboutHeading,
  preorderDetailFacts,
  preorderDetailIntro,
  preorderOrderCardHeading,
} from "@/lib/preorder-detail-copy";
import { formatCollectionLabel } from "@/lib/pre-order";
import PreOrderDetailShell from "./PreOrderDetailShell";
import PreOrderPageOrder from "./PreOrderPageOrder";
import PreOrderPageStory from "./PreOrderPageStory";
import PreOrderPageSupport from "./PreOrderPageSupport";

export default function PreOrderPageContent({
  standSlug,
  standName,
  timezone,
  currency,
  accentColor,
  page,
  pageProducts,
  catalogProducts,
}: {
  standSlug: string;
  standName: string;
  timezone: string;
  currency: string;
  accentColor: string | null;
  page: {
    slug: string;
    title: string;
    description: string | null;
    collectionAt: Date;
    orderByAt: Date;
    collectionNote: string | null;
    handoverMode: string;
  };
  pageProducts: PublicProductCard[];
  catalogProducts: PublicProductCard[];
}) {
  const ordersOpen = page.orderByAt.getTime() > Date.now();
  const facts = preorderDetailFacts({
    collectionAt: page.collectionAt,
    orderByAt: page.orderByAt,
    timeZone: timezone,
    handoverMode: page.handoverMode,
    ordersOpen,
  });
  const intro = preorderDetailIntro({
    standSlug,
    pageSlug: page.slug,
    description: page.description,
    productDescription: pageProducts[0]?.description ?? null,
  });
  const aboutBody =
    pageProducts.length === 1
      ? pageProducts[0]?.description?.trim() || page.description?.trim() || null
      : page.description?.trim() || null;
  const handover = preorderHandoverHeading(page.handoverMode);
  const collectionBody = [
    `${handover}: ${formatPreorderCollectionDate(page.collectionAt, timezone)}`,
    page.collectionNote?.trim() || null,
  ]
    .filter(Boolean)
    .join("\n");
  const collectionReminder = [
    `${handover}: ${formatCollectionLabel(page.collectionAt, timezone)}`,
    page.collectionNote?.trim() || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PreOrderDetailShell accentColor={accentColor}>
      <PreOrderPageStory
        standName={standName}
        title={page.title}
        intro={intro}
        ordersOpen={ordersOpen}
        facts={facts}
      />
      <PreOrderPageOrder
        standSlug={standSlug}
        currency={currency}
        products={pageProducts}
        catalogProducts={catalogProducts}
        cardHeading={preorderOrderCardHeading({
          standSlug,
          pageSlug: page.slug,
          productCount: pageProducts.length,
        })}
        collectionReminder={collectionReminder}
        ordersOpen={ordersOpen}
      />
      <PreOrderPageSupport
        aboutHeading={preorderAboutHeading({
          standSlug,
          pageSlug: page.slug,
          productCount: pageProducts.length,
        })}
        aboutBody={aboutBody}
        collectionHeading={`${handover} details`}
        collectionBody={collectionBody || null}
      />
    </PreOrderDetailShell>
  );
}
