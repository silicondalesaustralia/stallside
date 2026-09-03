import Image from "next/image";
import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import { formatMoney } from "@/lib/public-product";
import { shopPagePath } from "@/lib/storefront/paths";
import ProductDetailActions from "@/app/s/[standSlug]/ProductDetailActions";

export default function StudioProductDetailBlock({
  showBackLink,
  metadata: meta,
  isEditing,
}: {
  showReviews?: boolean;
  showBackLink: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
}) {
  const product = meta.commerceContext?.product;
  if (!product) {
    if (!isEditing) return null;
    return (
      <section className="studio-section">
        <div className="studio-section__inner storefront-page-content--narrow">
          <p className="text-[var(--muted)]">
            Add a product to preview the product page layout.
          </p>
        </div>
      </section>
    );
  }

  const catalog = meta.commerceContext?.catalogProducts ?? [product];
  const backHref = shopPagePath(
    meta.storefrontSlug,
    "shop",
    meta.draft,
    meta.basePath,
  );
  const backLabel =
    meta.templateId === "farmhouse"
      ? "← Back to what's available"
      : "← Back to shop";

  return (
    <article className="storefront-page-content storefront-page-content--narrow">
      {showBackLink ? (
        <Link
          href={backHref}
          className="text-sm font-semibold text-[var(--leaf-dark)] underline"
        >
          {backLabel}
        </Link>
      ) : null}
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt=""
          width={800}
          height={800}
          sizes="(max-width: 768px) 100vw, 640px"
          priority
          className="mt-6 aspect-square w-full rounded-[var(--studio-card-radius,var(--storefront-radius,var(--radius)))] object-cover"
        />
      ) : null}
      <h1 className="studio-display mt-6 text-3xl font-bold tracking-tight text-[var(--field)]">
        {product.name}
      </h1>
      {product.isPreOrder ? (
        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
          Pre-order
        </p>
      ) : null}
      <p className="mt-3 font-receipt text-2xl text-[var(--stand-secondary,var(--ok))]">
        {formatMoney(product.priceCents, meta.currency)}
      </p>
      {product.description ? (
        <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
          {product.description}
        </p>
      ) : null}
      <div className="mt-8">
        <ProductDetailActions
          standSlug={meta.standSlug}
          currency={meta.currency}
          product={product}
          catalogProducts={catalog}
        />
      </div>
    </article>
  );
}
