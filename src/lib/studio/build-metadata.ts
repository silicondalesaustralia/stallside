import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { buildPuckSpikeMetadata } from "@/lib/puck/build-metadata";
import { loadStorefrontReviews } from "./load-reviews";
import { ensureCustomPages } from "./custom-pages";
import { customPagePublicPath, footerPagesFromCustomPages } from "./custom-page-paths";
import { parseHeaderMenu } from "./header-menu";
import { parseAnnouncementBar } from "./announcement-bar";
import { standPaymentBrands, withSquarePaymentsReady } from "@/lib/stand-payment-brands";
import type { PaymentBrand } from "@/lib/payment-brand-assets";
import { ensureBlogSettings } from "./blog";
import { buildStudioHeaderNav } from "./navigation";
import type { StudioMetadata, StudioTemplateId } from "./types";

async function loadPaymentBrands(ctx: NonNullable<StorefrontContext>): Promise<PaymentBrand[]> {
  try {
    const owner = await withSquarePaymentsReady(ctx.owner);
    return standPaymentBrands(ctx.stand, { ...owner, user: ctx.owner.user });
  } catch (err) {
    console.error("[studio metadata] payment brands", err);
    return standPaymentBrands(ctx.stand, { ...ctx.owner, squarePaymentsReady: false, user: ctx.owner.user });
  }
}

export async function buildStudioMetadata(
  ctx: NonNullable<StorefrontContext>,
  templateId: StudioTemplateId,
  draft?: boolean,
): Promise<StudioMetadata> {
  const base = await buildPuckSpikeMetadata(ctx, draft);
  const [reviews, paymentBrands] = await Promise.all([
    loadStorefrontReviews(ctx.owner.id, 6),
    loadPaymentBrands(ctx),
  ]);

  const categories = ctx.categories
    .filter((c) => c.showOnWebsite !== false)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      imageUrl: c.imageUrl,
    }));

  const fulfilmentOptions = ctx.fulfilmentOptions;
  const customPages = ensureCustomPages(ctx.storefront.draftConfig);
  const usePublished = !draft && ctx.storefront.isPublished;
  const configSource =
    usePublished && ctx.storefront.publishedConfig
      ? ctx.storefront.publishedConfig
      : ctx.storefront.draftConfig;
  const publishedPages = ensureCustomPages(configSource);

  const pagesForNav = draft ? customPages : publishedPages;
  const blogSettings = ensureBlogSettings(configSource);

  return {
    ...base,
    templateId,
    categories,
    reviews,
    fulfilmentOptions,
    standId: ctx.stand.id,
    draftRevision: ctx.storefront.draftRevision,
    customNavPages: buildStudioHeaderNav(
      pagesForNav,
      blogSettings,
      ctx.storefront.slug,
      draft,
      base.basePath,
    ),
    linkablePages: pagesForNav
      .filter((p) => p.enabled)
      .map((p) => ({
        slug: p.slug,
        label: p.navLabel || p.title,
        href: customPagePublicPath(ctx.storefront.slug, p, draft, base.basePath),
      })),
    headerMenu: parseHeaderMenu(configSource),
    paymentBrands,
    announcementBar: parseAnnouncementBar(configSource),
    customFooterPages: footerPagesFromCustomPages(
      pagesForNav,
      ctx.storefront.slug,
      draft,
      base.basePath,
    ),
  };
}
