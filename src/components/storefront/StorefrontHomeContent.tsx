import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { enabledSections } from "@/lib/storefront/config";
import { mapPublicProduct } from "@/lib/public-product";
import type { PublicProductCard } from "@/lib/public-product";
import StorefrontHero from "./StorefrontHero";
import StorefrontProductGrid from "./StorefrontProductGrid";
import StorefrontCategoryChips from "./StorefrontCategoryChips";
import {
  StorefrontFarmStandSection,
  StorefrontHowOrderingSection,
  StorefrontPickupSection,
  StorefrontSocialLinks,
} from "./StorefrontSections";
import { shopPagePath } from "@/lib/storefront/paths";
import Link from "next/link";
import { storefrontButtonClass } from "@/lib/storefront/branding";
import Image from "next/image";

function mapProducts(
  ctx: NonNullable<StorefrontContext>,
): PublicProductCard[] {
  return ctx.products.map((p) =>
    mapPublicProduct(p, {
      showExactStock: ctx.stand.showExactStock,
      showPublicScarcity: ctx.stand.showPublicScarcity,
      timeZone: ctx.stand.timezone,
    }),
  );
}

export default function StorefrontHomeContent({
  ctx,
  draft,
}: {
  ctx: NonNullable<StorefrontContext>;
  draft?: boolean;
}) {
  const products = mapProducts(ctx);
  const sections = enabledSections(ctx.config);
  const btnClass = storefrontButtonClass(ctx.branding);
  const featuredIds = ctx.config.featuredProductIds ?? [];
  const featured =
    featuredIds.length > 0
      ? products.filter((p) => featuredIds.includes(p.id)).slice(0, 8)
      : products.slice(0, 4);

  return (
    <>
      {sections.map((section) => {
        switch (section.id) {
          case "hero":
            return (
              <StorefrontHero
                key={section.id}
                branding={ctx.branding}
                storefrontSlug={ctx.storefront.slug}
                draft={draft}
                hasProducts={products.length > 0}
              />
            );
          case "featured_products":
            if (featured.length === 0) return null;
            return (
              <section
                key={section.id}
                className="mx-auto max-w-5xl px-4 py-12 sm:px-6"
              >
                <div className="mb-6 flex items-end justify-between gap-4">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
                    Featured
                  </h2>
                  {products.length > featured.length ? (
                    <Link
                      href={shopPagePath(ctx.storefront.slug, "shop", draft)}
                      className="text-sm font-semibold text-[var(--leaf-dark)] underline"
                    >
                      View all
                    </Link>
                  ) : null}
                </div>
                <StorefrontProductGrid
                  storefrontSlug={ctx.storefront.slug}
                  standSlug={ctx.stand.slug}
                  currency={ctx.stand.currency}
                  products={featured}
                  branding={ctx.branding}
                  draft={draft}
                  compact
                />
              </section>
            );
          case "categories":
            if (ctx.categories.length === 0) return null;
            return (
              <section
                key={section.id}
                className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
              >
                <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
                  Shop by category
                </h2>
                <StorefrontCategoryChips
                  storefrontSlug={ctx.storefront.slug}
                  categories={ctx.categories}
                  draft={draft}
                />
                <div className="mt-6">
                  <Link
                    href={shopPagePath(ctx.storefront.slug, "shop", draft)}
                    className={`inline-flex ${btnClass}`}
                  >
                    Browse shop
                  </Link>
                </div>
              </section>
            );
          case "about":
            if (!ctx.branding.about) return null;
            return (
              <section
                key={section.id}
                className="mx-auto max-w-3xl px-4 py-12 sm:px-6"
              >
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
                  About us
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed text-[var(--muted)]">
                  {ctx.branding.about}
                </p>
              </section>
            );
          case "how_ordering":
            return (
              <section
                key={section.id}
                className="mx-auto max-w-3xl px-4 py-12 sm:px-6"
              >
                <StorefrontHowOrderingSection
                  fulfilmentIntents={ctx.owner.fulfilmentIntents}
                />
              </section>
            );
          case "pickup_delivery":
            return (
              <div
                key={section.id}
                className="mx-auto max-w-3xl px-4 py-8 sm:px-6"
              >
                <StorefrontPickupSection
                  fulfilmentIntents={ctx.owner.fulfilmentIntents}
                  regionLabel={ctx.branding.regionLabel}
                />
              </div>
            );
          case "farm_stand":
            if (
              ctx.businessMode !== "FARM_STAND" &&
              ctx.businessMode !== "BOTH"
            ) {
              return null;
            }
            return (
              <div
                key={section.id}
                className="mx-auto max-w-3xl px-4 py-8 sm:px-6"
              >
                <StorefrontFarmStandSection
                  standName={ctx.stand.name}
                  standSlug={ctx.stand.slug}
                  suburb={ctx.owner.suburb}
                  businessMode={ctx.businessMode}
                  branding={ctx.branding}
                />
              </div>
            );
          case "gallery": {
            const images = ctx.config.galleryImages ?? [];
            if (images.length === 0) return null;
            return (
              <section
                key={section.id}
                className="mx-auto max-w-5xl px-4 py-12 sm:px-6"
              >
                <h2 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
                  Gallery
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((url) => (
                    <div
                      key={url}
                      className="relative aspect-square overflow-hidden rounded-[var(--storefront-radius,var(--radius))]"
                    >
                      <Image src={url} alt="" fill className="object-cover" sizes="33vw" />
                    </div>
                  ))}
                </div>
              </section>
            );
          }
          case "testimonials":
            return null;
          case "contact":
            return (
              <section
                key={section.id}
                className="mx-auto max-w-3xl px-4 py-12 sm:px-6"
              >
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
                  Get in touch
                </h2>
                <p className="mt-4 text-[var(--muted)]">
                  Questions about an order or our products?
                </p>
                <a
                  href={`mailto:${ctx.branding.contactEmail}`}
                  className={`mt-6 inline-flex ${btnClass}`}
                >
                  Email us
                </a>
                {ctx.branding.contactPhone ? (
                  <p className="mt-4 text-sm text-[var(--muted)]">
                    Phone:{" "}
                    <a
                      href={`tel:${ctx.branding.contactPhone}`}
                      className="font-semibold text-[var(--field)]"
                    >
                      {ctx.branding.contactPhone}
                    </a>
                  </p>
                ) : null}
              </section>
            );
          case "social":
            return (
              <section
                key={section.id}
                className="mx-auto max-w-3xl px-4 py-8 sm:px-6"
              >
                <StorefrontSocialLinks branding={ctx.branding} />
              </section>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
