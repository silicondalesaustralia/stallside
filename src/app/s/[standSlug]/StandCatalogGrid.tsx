"use client";

import Image from "next/image";
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
  }

  return (
    <div className="mt-6 flex flex-col gap-4 pb-24">
      {error ? <p className="text-sm text-[var(--gone)]">{error}</p> : null}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {products.map((product) => {
          const href = standProductPath(standSlug, product.slug);
          return (
            <li
              key={product.id}
              className={`flex flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] sm:only:col-span-2 sm:only:mx-auto sm:only:w-full sm:only:max-w-[17.5rem] ${
                product.soldOut ? "opacity-50" : ""
              }`}
            >
              <Link href={href} className="block p-3 pb-0 sm:p-0">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt=""
                    width={640}
                    height={640}
                    sizes="(max-width: 640px) 100vw, 280px"
                    className="aspect-[4/3] w-full rounded-[calc(var(--radius)-2px)] object-cover sm:aspect-square sm:rounded-none"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center rounded-[calc(var(--radius)-2px)] bg-[var(--wash)] px-3 text-center sm:aspect-square sm:rounded-none">
                    <span className="font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-[var(--field)] sm:text-lg">
                      {product.name}
                    </span>
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-1.5 p-4 sm:gap-1 sm:p-3">
                <Link
                  href={href}
                  className="text-base font-semibold leading-snug hover:underline sm:text-[15px]"
                >
                  {product.name}
                </Link>
                <p
                  className={`text-sm font-medium sm:text-xs ${
                    product.isPreOrder
                      ? "text-[var(--leaf-dark)]"
                      : "invisible"
                  }`}
                  aria-hidden={!product.isPreOrder}
                >
                  Pre-order
                </p>
                <p className="font-receipt text-lg text-[var(--stand-secondary,var(--ok))] sm:text-base">
                  {formatMoney(product.priceCents, currency)}
                </p>
                <p
                  className={`font-receipt text-sm sm:text-xs ${stockTone(product.label)}`}
                >
                  {product.label}
                </p>
                <button
                  type="button"
                  disabled={product.soldOut}
                  onClick={() => addOne(product)}
                  className="mt-4 w-full rounded-[var(--radius-pill)] bg-[var(--leaf)] px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40 sm:mt-auto sm:py-2"
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
