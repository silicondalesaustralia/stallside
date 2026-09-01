"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import {
  addToStandCart,
  readStandCart,
} from "@/lib/stand-cart-storage";
import {
  CART_MIX_COLLECTION_DAYS,
  CART_MIX_TAKE_NOW_PREORDER,
} from "@/lib/pre-order";
import { shopProductPath } from "@/lib/storefront/paths";
import { writeShopOrigin } from "@/lib/storefront/shop-origin";
import { storefrontButtonClass } from "@/lib/storefront/branding";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";

function stockTone(label: string) {
  if (label.startsWith("Sold out") || label.startsWith("Orders closed")) {
    return "text-[var(--gone)]";
  }
  if (label === "Low stock") return "text-[var(--warn)]";
  return "text-[var(--ok)]";
}

function cartConflictMessage(
  product: PublicProductCard,
  other: PublicProductCard,
): string | null {
  if (Boolean(other.isPreOrder) !== Boolean(product.isPreOrder)) {
    return CART_MIX_TAKE_NOW_PREORDER;
  }
  if (
    product.isPreOrder &&
    other.isPreOrder &&
    other.collectionAtMs !== product.collectionAtMs
  ) {
    return CART_MIX_COLLECTION_DAYS;
  }
  return null;
}

export default function StorefrontProductGrid({
  storefrontSlug,
  standSlug,
  currency,
  products,
  branding,
  draft,
  compact = false,
}: {
  storefrontSlug: string;
  standSlug: string;
  currency: string;
  products: PublicProductCard[];
  branding: ResolvedStorefrontBranding;
  draft?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const btnClass = storefrontButtonClass(branding);

  function addOne(product: PublicProductCard) {
    setError(null);
    writeShopOrigin(storefrontSlug);
    if (product.soldOut) return;
    if (product.hasOptions) {
      router.push(shopProductPath(storefrontSlug, product.slug, draft));
      return;
    }
    const cart = readStandCart(standSlug);
    for (const [id, qty] of Object.entries(cart)) {
      if (qty <= 0 || id === product.id) continue;
      const other = products.find((p) => p.id === id);
      if (!other) continue;
      const msg = cartConflictMessage(product, other);
      if (msg) {
        setError(msg);
        return;
      }
    }
    addToStandCart(standSlug, product.id, 1, product.stockQuantity);
  }

  if (products.length === 0) {
    return (
      <div className="rounded-[var(--storefront-radius,var(--radius))] border border-dashed border-[var(--line)] bg-[var(--wash)] px-6 py-12 text-center">
        <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          Products coming soon
        </p>
        <p className="mt-2 text-[var(--muted)]">
          Check back shortly — new items are on the way.
        </p>
      </div>
    );
  }

  const cols = compact
    ? "grid-cols-2 gap-3 sm:grid-cols-3"
    : "grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div>
      {error ? <p className="mb-4 text-sm text-[var(--gone)]">{error}</p> : null}
      <ul className={`grid ${cols}`}>
        {products.map((product) => {
          const href = shopProductPath(storefrontSlug, product.slug, draft);
          return (
            <li
              key={product.id}
              className={`flex flex-col overflow-hidden rounded-[var(--storefront-radius,var(--radius))] border border-[var(--line)] bg-[var(--panel)] shadow-sm ${
                product.soldOut ? "opacity-60" : ""
              }`}
            >
              <Link href={href} className="block">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt=""
                    width={640}
                    height={640}
                    sizes="(max-width: 640px) 50vw, 280px"
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-[var(--wash)] px-4 text-center">
                    <span className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[var(--field)]">
                      {product.name}
                    </span>
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <Link href={href} className="font-semibold leading-snug hover:underline">
                  {product.name}
                </Link>
                <p className="font-receipt text-lg text-[var(--stand-secondary,var(--ok))]">
                  {formatMoney(product.priceCents, currency)}
                </p>
                <p className={`text-xs font-medium ${stockTone(product.label)}`}>
                  {product.label}
                </p>
                {!product.soldOut ? (
                  <button
                    type="button"
                    onClick={() => addOne(product)}
                    className={`mt-auto w-full text-center text-sm ${btnClass}`}
                  >
                    {product.hasOptions ? "Choose options" : "Add to cart"}
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
