"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { PublicProductCard } from "@/lib/public-product";
import {
  addToStandCart,
  productQtyInCart,
  readStandCartLines,
} from "@/lib/stand-cart-storage";
import {
  CART_MIX_COLLECTION_DAYS,
  CART_MIX_PREORDER_SETTINGS,
  CART_MIX_TAKE_NOW_PREORDER,
} from "@/lib/pre-order";
import { standCartPath } from "@/lib/stand-seo";
import PreOrderDetails from "@/app/s/[standSlug]/PreOrderDetails";
import PreOrderPageProductRow from "@/app/s/[standSlug]/pre/[pageSlug]/PreOrderPageProductRow";

function cartConflictMessage(
  target: PublicProductCard,
  other: PublicProductCard,
): string | null {
  if (Boolean(other.isPreOrder) !== Boolean(target.isPreOrder)) {
    return CART_MIX_TAKE_NOW_PREORDER;
  }
  if (
    target.isPreOrder &&
    other.isPreOrder &&
    other.collectionAtMs !== target.collectionAtMs
  ) {
    return CART_MIX_COLLECTION_DAYS;
  }
  if (
    target.isPreOrder &&
    other.isPreOrder &&
    (other.paymentTiming !== target.paymentTiming ||
      other.handoverMode !== target.handoverMode ||
      other.depositPercent !== target.depositPercent)
  ) {
    return CART_MIX_PREORDER_SETTINGS;
  }
  return null;
}

export default function MenuOrder({
  standSlug,
  currency,
  products,
  catalogProducts,
  isPreOrderDrop,
}: {
  standSlug: string;
  currency: string;
  products: PublicProductCard[];
  catalogProducts: PublicProductCard[];
  isPreOrderDrop: boolean;
}) {
  const router = useRouter();
  const [qtys, setQtys] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const p of products) init[p.id] = 0;
    return init;
  });
  const [error, setError] = useState<string | null>(null);

  const selectedCount = useMemo(
    () => Object.values(qtys).reduce((s, n) => s + n, 0),
    [qtys],
  );

  function setQty(productId: string, n: number) {
    setQtys((prev) => ({ ...prev, [productId]: Math.max(0, n) }));
  }

  function addSelected(goCart: boolean) {
    setError(null);
    const picks = products.filter((p) => (qtys[p.id] ?? 0) > 0);
    if (picks.length === 0) {
      setError("Add a quantity for at least one item.");
      return;
    }

    const lines = readStandCartLines(standSlug);
    for (const product of picks) {
      for (const line of lines) {
        if (line.productId === product.id) continue;
        const other = catalogProducts.find((p) => p.id === line.productId);
        if (!other) continue;
        const msg = cartConflictMessage(product, other);
        if (msg) {
          setError(msg);
          return;
        }
      }
      const addQty = qtys[product.id] ?? 0;
      const remaining =
        product.stockQuantity - productQtyInCart(lines, product.id);
      if (addQty > remaining) {
        setError(`Not enough left of ${product.name}.`);
        return;
      }
    }

    for (const product of picks) {
      const addQty = qtys[product.id] ?? 0;
      if (product.hasOptions) continue;
      addToStandCart(
        standSlug,
        product.id,
        addQty,
        product.stockQuantity,
        [],
      );
    }

    setQtys((prev) => {
      const next = { ...prev };
      for (const p of picks) next[p.id] = 0;
      return next;
    });

    if (goCart) router.push(standCartPath(standSlug));
  }

  const sampleDetails = products.find((p) => p.preOrderDetails)?.preOrderDetails;

  return (
    <div className="mt-6 flex flex-col gap-6">
      {isPreOrderDrop && sampleDetails ? (
        <PreOrderDetails details={sampleDetails} />
      ) : null}

      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {products.map((product) => {
          const remaining =
            product.stockQuantity -
            productQtyInCart(readStandCartLines(standSlug), product.id);
          return (
            <PreOrderPageProductRow
              key={product.id}
              standSlug={standSlug}
              currency={currency}
              product={product}
              qty={qtys[product.id] ?? 0}
              remaining={remaining}
              onQty={(n) => setQty(product.id, n)}
            />
          );
        })}
      </ul>

      {error ? (
        <p className="text-center text-sm text-[var(--gone)]">{error}</p>
      ) : null}

      <div className="mx-auto flex w-full max-w-xs flex-col gap-2">
        <button
          type="button"
          disabled={selectedCount < 1}
          onClick={() => addSelected(false)}
          className="w-full rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-base font-semibold disabled:opacity-40"
        >
          Add to cart
        </button>
        <button
          type="button"
          disabled={selectedCount < 1}
          onClick={() => addSelected(true)}
          className="w-full rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-base font-semibold text-white disabled:opacity-40"
        >
          Add &amp; checkout
        </button>
      </div>
    </div>
  );
}
