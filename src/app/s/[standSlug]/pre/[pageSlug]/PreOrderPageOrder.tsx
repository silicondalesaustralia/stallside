"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import {
  addToStandCart,
  productQtyInCart,
  readStandCartLines,
} from "@/lib/stand-cart-storage";
import {
  CART_MIX_COLLECTION_DAYS,
  CART_MIX_TAKE_NOW_PREORDER,
} from "@/lib/pre-order";
import {
  formatTierSaving,
  lineTotalWithTiers,
} from "@/lib/price-tiers";
import { standCartPath, standProductPath } from "@/lib/stand-seo";
import QtyStepper from "../../QtyStepper";
import PreOrderDetails from "../../PreOrderDetails";

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

export default function PreOrderPageOrder({
  standSlug,
  currency,
  products,
  catalogProducts,
}: {
  standSlug: string;
  currency: string;
  products: PublicProductCard[];
  catalogProducts: PublicProductCard[];
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
    else router.refresh();
  }

  const sampleDetails = products.find((p) => p.preOrderDetails)?.preOrderDetails;

  return (
    <div className="mt-6 flex flex-col gap-6">
      {sampleDetails ? <PreOrderDetails details={sampleDetails} /> : null}

      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {products.map((product) => {
          const remaining =
            product.stockQuantity -
            productQtyInCart(readStandCartLines(standSlug), product.id);
          const qty = qtys[product.id] ?? 0;
          const priced =
            product.priceTiers.length > 0 && qty > 0
              ? lineTotalWithTiers(
                  product.priceCents,
                  qty,
                  product.priceTiers,
                )
              : null;
          const labelCents = priced
            ? priced.lineTotalCents
            : product.priceCents;
          const saveCents =
            priced?.usedTier
              ? formatTierSaving(
                  product.priceCents,
                  qty,
                  priced.lineTotalCents,
                )
              : 0;
          return (
            <li key={product.id} className="flex flex-col gap-3 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="mt-1 font-receipt text-lg text-[var(--stand-secondary,var(--ok))]">
                    {formatMoney(labelCents, currency)}
                    {product.priceTiers.length > 0 && qty > 1 ? (
                      <span className="ml-2 text-sm text-[var(--muted)]">
                        for {qty}
                      </span>
                    ) : null}
                  </p>
                  {saveCents > 0 ? (
                    <p className="mt-0.5 text-sm font-medium text-[var(--ok)]">
                      Save {formatMoney(saveCents, currency)} vs each
                    </p>
                  ) : null}
                  {product.priceTiers.length > 0 ? (
                    <p className="mt-1 font-receipt text-sm text-[var(--muted)]">
                      {product.priceTiers
                        .map(
                          (t) =>
                            `${t.qty} for ${formatMoney(t.totalCents, currency)}`,
                        )
                        .join(" · ")}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {product.label}
                  </p>
                </div>
                {product.hasOptions ? (
                  <Link
                    href={standProductPath(standSlug, product.slug)}
                    className="rounded-[var(--radius-pill)] border border-[var(--leaf)] px-4 py-2 text-sm font-semibold text-[var(--leaf-dark)]"
                  >
                    Choose options
                  </Link>
                ) : product.soldOut || remaining <= 0 ? (
                  <p className="text-sm text-[var(--gone)]">Sold out</p>
                ) : (
                  <QtyStepper
                    value={qty}
                    max={Math.max(0, remaining)}
                    onChange={(n) => setQty(product.id, n)}
                  />
                )}
              </div>
            </li>
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
