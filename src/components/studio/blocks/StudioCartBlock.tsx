import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import { shopAllProductsPath } from "@/lib/storefront/cart-paths";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";
import SectionCopy from "@/components/studio/SectionCopy";
import StandCartCheckout from "@/app/s/[standSlug]/StandCartCheckout";
import CartBlockPreview from "./CartBlockPreview";

/** Cart & checkout: the shopper's cart, details and payment choice (before the payment screen). */
export default function StudioCartBlock({
  metadata: meta,
  isEditing,
}: {
  metadata: StudioMetadata;
  isEditing?: boolean;
}) {
  const cart = meta.commerceContext?.cart;
  if (!isEditing && !cart) return null;
  const shopHref = shopAllProductsPath(meta.storefrontSlug, meta.draft, meta.basePath);

  return (
    <div className="storefront-page-content storefront-page-content--narrow">
      <Link href={shopHref} className="text-sm font-semibold text-[var(--leaf-dark)] underline">
        <SectionCopy k="backLink" fallback="← Continue shopping" />
      </Link>
      <SectionHeadingTag defaultTag="h1" className="studio-display mt-4 text-3xl font-bold text-[var(--field)]">
        <SectionCopy k="heading" fallback="Your cart" />
      </SectionHeadingTag>
      {isEditing || !cart ? (
        <CartBlockPreview products={meta.commerceContext?.catalogProducts ?? []} currency={meta.currency} shopHref={shopHref} />
      ) : (
        <StandCartCheckout {...cart} shopHref={shopHref} />
      )}
    </div>
  );
}
