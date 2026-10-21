import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { buildStorefrontPageMetadata, seoConfigSource } from "@/lib/studio/resolve-seo-metadata";
import { COMMERCE_PREORDER_KEY } from "@/lib/studio/commerce-pages";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import StudioPreOrderBlock from "@/components/studio/blocks/StudioPreOrderBlock";
import PreOrderPageBody from "@/components/studio/blocks/PreOrderPageBody";
import { menuPageSeo } from "@/lib/seo/menu-page-seo";
import CommerceLayoutView from "./CommerceLayoutView";
import { loadPreOrderPageData } from "./load-preorder-page";

type ViewProps = { slug: string; pageSlug: string; draft: boolean };

async function loadPage({ slug, pageSlug, draft }: ViewProps) {
  const ctx = await loadStorefrontPage(slug, draft);
  const page = await prisma.preOrderPage.findFirst({
    where: { standId: ctx.stand.id, slug: decodeURIComponent(pageSlug).trim().toLowerCase(), isActive: true },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return { ctx, page };
}

export async function preOrderPageViewMetadata(props: ViewProps): Promise<Metadata> {
  try {
    const { ctx, page } = await loadPage(props);
    if (!page) return { title: "Pre-order", robots: { index: false, follow: false } };
    const published = ctx.storefront.isPublished && !props.draft;
    return buildStorefrontPageMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published,
      configRaw: seoConfigSource(ctx.storefront.draftConfig, ctx.storefront.publishedConfig, published),
      entityType: "menu",
      entityId: page.id,
      defaults: { title: page.title, description: page.description ?? page.title, ogImageUrl: page.imageUrl },
      path: `/pre-orders/${encodeURIComponent(page.slug)}`,
    });
  } catch {
    return { title: "Pre-order", robots: { index: false, follow: false } };
  }
}

/** A stand pre-order page shown on the website at `/pre-orders/{page}`, in the seller's pre-order layout. */
export default async function PreOrderPageView(props: ViewProps) {
  const ctx = await loadStorefrontPage(props.slug, props.draft);
  const data = await loadPreOrderPageData(ctx, props.pageSlug);
  if (!data) notFound();
  return (
    <CommerceLayoutView
      ctx={ctx}
      draft={props.draft}
      activePage="menu"
      pageKey={COMMERCE_PREORDER_KEY}
      commerceContext={{ kind: "preorder", ownerId: ctx.owner.id, preOrder: data }}
      renderBlock={(metadata) => <StudioPreOrderBlock metadata={metadata} />}
      fallback={<PreOrderPageBody data={data} />}
      seo={menuPageSeo(ctx, {
        path: `/pre-orders/${encodeURIComponent(data.page.slug)}`,
        name: data.page.title,
        description: data.page.description,
        imageUrl: data.page.imageUrl,
        products: data.pageProducts,
        isPreOrder: true,
      })}
      after={<StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />}
    />
  );
}
