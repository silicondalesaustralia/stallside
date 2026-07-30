"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import { addToStandCart, readStandCart } from "@/lib/stand-cart-storage";
import {
  CART_MIX_COLLECTION_DAYS,
  CART_MIX_TAKE_NOW_PREORDER,
} from "@/lib/pre-order";
import { standProductPath } from "@/lib/stand-seo";

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

export default function StandCatalogGrid({
  standSlug,
  currency,
  products,
}: {
  standSlug: string;
  currency: string;
  products: PublicProductCard[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function addOne(product: PublicProductCard) {
    setError(null);
    if (product.soldOut) return;
    if (product.hasOptions) {
      router.push(standProductPath(standSlug, product.slug));
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
    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-col gap-4 pb-24">
      {error ? <p className="text-sm text-[var(--gone)]">{error}</p> : null}
      <ul className="grid grid-cols-2 gap-3 sm:gap-4">
        {products.map((product) => {
          const href = standProductPath(standSlug, product.slug);
          return (
            <li
              key={product.id}
              className={`flex flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] only:col-span-2 only:mx-auto only:w-full only:max-w-[17.5rem] ${
                product.soldOut ? "opacity-50" : ""
              }`}
            >
              <Link href={href} className="block">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-[var(--wash)] px-3 text-center">
                    <span className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[var(--field)]">
                      {product.name}
                    </span>
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <Link href={href} className="font-semibold leading-snug hover:underline">
                  {product.name}
                </Link>
                <p
                  className={`text-xs font-medium ${
                    product.isPreOrder
                      ? "text-[var(--leaf-dark)]"
                      : "invisible"
                  }`}
                  aria-hidden={!product.isPreOrder}
                >
                  Pre-order
                </p>
                <p className="font-receipt text-base text-[var(--stand-secondary,var(--ok))]">
                  {formatMoney(product.priceCents, currency)}
                </p>
                <p className={`font-receipt text-xs ${stockTone(product.label)}`}>
                  {product.label}
                </p>
                <button
                  type="button"
                  disabled={product.soldOut}
                  onClick={() => addOne(product)}
                  className="mt-auto w-full rounded-[var(--radius-pill)] bg-[var(--leaf)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {product.hasOptions ? "Choose options" : "Add"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
