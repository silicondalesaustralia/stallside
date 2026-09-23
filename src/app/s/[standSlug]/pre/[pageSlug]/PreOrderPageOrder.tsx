"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { PublicProductCard } from "@/lib/public-product";
import { lineTotalWithTiers } from "@/lib/price-tiers";
import { readStandCartLines } from "@/lib/stand-cart-storage";
import { standCartPath } from "@/lib/stand-seo";
import {
  addPreOrderSelections,
  remainingForProduct,
} from "@/lib/pre-order-page-cart";
import PreOrderPageActions from "./PreOrderPageActions";
import PreOrderPageProductRow from "./PreOrderPageProductRow";

export default function PreOrderPageOrder({
  standSlug,
  currency,
  products,
  catalogProducts,
  cardHeading,
  collectionReminder,
  ordersOpen,
}: {
  standSlug: string;
  currency: string;
  products: PublicProductCard[];
  catalogProducts: PublicProductCard[];
  cardHeading: string;
  collectionReminder: string | null;
  ordersOpen: boolean;
}) {
  const router = useRouter();
  const [qtys, setQtys] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const p of products) init[p.id] = 0;
    return init;
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedCount = useMemo(
    () => Object.values(qtys).reduce((s, n) => s + n, 0),
    [qtys],
  );
  const subtotalCents = useMemo(() => {
    let total = 0;
    for (const p of products) {
      const q = qtys[p.id] ?? 0;
      if (q <= 0) continue;
      total += lineTotalWithTiers(p.priceCents, q, p.priceTiers).lineTotalCents;
    }
    return total;
  }, [products, qtys]);

  function addSelected(goCart: boolean) {
    if (busy) return;
    setError(null);
    const picks = products.filter((p) => (qtys[p.id] ?? 0) > 0);
    if (picks.length === 0) {
      setError("Choose a quantity to continue.");
      return;
    }
    if (!ordersOpen) {
      setError("Orders are closed for this pre-order.");
      return;
    }
    setBusy(true);
    try {
      const result = addPreOrderSelections({
        standSlug,
        picks,
        qtys,
        catalogProducts,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setQtys((prev) => {
        const next = { ...prev };
        for (const p of picks) next[p.id] = 0;
        return next;
      });
      if (goCart) router.push(standCartPath(standSlug));
    } finally {
      setBusy(false);
    }
  }

  const lines = readStandCartLines(standSlug);
  const canOrder = ordersOpen && selectedCount > 0 && !busy;

  return (
    <section className="rounded-[18px] border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-display)] text-[20px] font-medium tracking-tight">
        {cardHeading}
      </h2>
      {!ordersOpen ? (
        <p className="mt-3 text-sm text-[var(--gone)]">
          Orders are closed for this collection.
        </p>
      ) : null}
      <ul className="mt-2">
        {products.map((product) => (
          <PreOrderPageProductRow
            key={product.id}
            standSlug={standSlug}
            currency={currency}
            product={product}
            qty={qtys[product.id] ?? 0}
            remaining={
              ordersOpen ? remainingForProduct(standSlug, product, lines) : 0
            }
            onQty={(n) =>
              setQtys((prev) => ({ ...prev, [product.id]: Math.max(0, n) }))
            }
            showIdentity={products.length > 1}
          />
        ))}
      </ul>
      <PreOrderPageActions
        selectedCount={selectedCount}
        subtotalCents={subtotalCents}
        currency={currency}
        canOrder={canOrder}
        error={error}
        collectionReminder={collectionReminder}
        onCheckout={() => addSelected(true)}
        onAddToCart={() => addSelected(false)}
      />
    </section>
  );
}
