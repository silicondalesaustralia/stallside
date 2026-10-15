import Image from "next/image";
import Link from "next/link";
import { formatMoney, type PublicProductCard } from "@/lib/public-product";
import SalePrice from "@/components/storefront/SalePrice";
import ProductDetailActions from "@/app/s/[standSlug]/ProductDetailActions";
import { ProductApprovedReviews } from "@/components/storefront/ProductApprovedReviews";

/** Product page when the site has no Web Studio product layout. */
export default function ProductFallbackArticle({
  product,
  catalogProducts,
  standSlug,
  currency,
  ownerId,
  backHref,
  backLabel,
  studioDisplay,
}: {
  product: PublicProductCard;
  catalogProducts: PublicProductCard[];
  standSlug: string;
  currency: string;
  ownerId: string;
  backHref: string;
  backLabel: string;
  studioDisplay: boolean;
}) {
  return (
    <article className="storefront-page-content storefront-page-content--narrow">
      <Link href={backHref} className="text-sm font-semibold text-[var(--leaf-dark)] underline">
        {backLabel}
      </Link>
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
      <h1
        className={`mt-6 text-3xl font-bold tracking-tight text-[var(--field)] ${studioDisplay ? "studio-display" : "font-[family-name:var(--font-display)]"}`}
      >
        {product.name}
      </h1>
      {product.isPreOrder ? (
        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
          Pre-order
        </p>
      ) : null}
      <p className="mt-3 font-receipt text-2xl text-[var(--stand-secondary,var(--ok))]">
        <SalePrice priceCents={product.priceCents} compareAtPriceCents={product.compareAtPriceCents} currency={currency} />
      </p>
      {product.description ? (
        <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">{product.description}</p>
      ) : null}
      {product.freshnessNote ? (
        <p className="mt-2 text-[var(--leaf-dark)]">{product.freshnessNote}</p>
      ) : null}
      {product.priceTiers.length > 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          {product.priceTiers.map((t) => `${t.qty} for ${formatMoney(t.totalCents, currency)}`).join(" · ")}
        </p>
      ) : null}
      <div className="mt-8">
        <ProductDetailActions
          standSlug={standSlug}
          currency={currency}
          product={product}
          catalogProducts={catalogProducts}
        />
      </div>
      <ProductApprovedReviews ownerId={ownerId} productId={product.id} />
    </article>
  );
}
