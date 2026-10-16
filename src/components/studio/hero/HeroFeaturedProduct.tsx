"use client";

import Image from "next/image";
import Link from "next/link";
import SalePrice from "@/components/storefront/SalePrice";
import SectionCopy from "@/components/studio/SectionCopy";
import { shopProductPath } from "@/lib/storefront/paths";
import type { StudioMetadata } from "@/lib/studio/types";
import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import type { HeroView } from "./types";

/** The product to feature: in stock with a photo first. */
export function featuredHeroProduct(meta: StudioMetadata): StudioMetadata["products"][number] | null {
  const ps = meta.products;
  return ps.find((p) => p.imageUrl && !p.soldOut) ?? ps.find((p) => !p.soldOut) ?? ps[0] ?? null;
}

/** "Featured product": one product shown large with its price and a link to buy. */
export default function HeroFeaturedProduct({ view }: { view: HeroView }) {
  const { meta } = view;
  const product = featuredHeroProduct(meta);
  if (!product) return null;
  const href = shopProductPath(meta.storefrontSlug, product, meta.draft, meta.basePath);
  const imageFirst = view.look.imageSide === "left";
  return (
    <section className={`${view.sectionClass} border-b border-[var(--line)] bg-[var(--wash)]`} style={view.style}>
      <div className="studio-split mx-auto grid max-w-[var(--studio-content-max)] items-center gap-8 py-10 studio-gutter studio-gutter--wide sf-sm:py-14 sf-lg:grid-cols-2 sf-lg:gap-12">
        <div className={imageFirst ? "sf-lg:order-2" : undefined}>
          <SectionCopy k="featuredEyebrow" fallback="Featured" as="p" className="studio-eyebrow text-[var(--leaf-dark)]" />
          <HeroTitle view={view} className="studio-display mt-2 text-4xl text-[var(--field)] sf-sm:text-5xl" />
          <HeroSubtitle view={view} className="mt-4 text-lg leading-relaxed text-[var(--muted)]" />
          <Link href={href} className="mt-6 block rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-[var(--leaf-dark)]">
            <span className="block font-semibold text-[var(--field)]">{product.name}</span>
            <span className="mt-1 block text-[var(--muted)]">
              <SalePrice priceCents={product.priceCents} compareAtPriceCents={product.compareAtPriceCents} currency={meta.currency} />
              {product.soldOut ? " · Sold out" : null}
            </span>
          </Link>
          {view.buttons ? <div className="mt-6 flex flex-wrap gap-3">{view.buttons}</div> : null}
        </div>
        <Link
          href={href}
          className="studio-section-image relative block aspect-square overflow-hidden rounded-[var(--studio-card-radius)] bg-[var(--panel)]"
        >
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill priority className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          ) : (
            <span className="flex h-full items-center justify-center p-8 text-center text-lg font-semibold text-[var(--muted)]">
              {product.name}
            </span>
          )}
        </Link>
      </div>
    </section>
  );
}
