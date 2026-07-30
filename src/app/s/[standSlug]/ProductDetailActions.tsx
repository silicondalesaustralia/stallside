"use client";

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
import { unitPriceWithOptions } from "@/lib/product-options";
import { standCartPath } from "@/lib/stand-seo";
import ProductMultiChoiceQty from "./ProductMultiChoiceQty";
import PreOrderDetails from "./PreOrderDetails";
import QtyStepper from "./QtyStepper";

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

export default function ProductDetailActions({
  standSlug,
  currency,
  product,
  catalogProducts,
}: {
  standSlug: string;
  currency: string;
  product: PublicProductCard;
  catalogProducts: PublicProductCard[];
}) {
  const router = useRouter();
  const singleGroup =
    product.optionGroups.length === 1 ? product.optionGroups[0] : null;
  const [qty, setQty] = useState(1);
  const [perChoiceQty, setPerChoiceQty] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const g of product.optionGroups) {
      if (g.choices[0]) init[g.id] = g.choices[0].id;
    }
    return init;
  });

  const choiceIds = useMemo(
    () => product.optionGroups.map((g) => selected[g.id]).filter(Boolean),
    [product.optionGroups, selected],
  );

  const unitCents = useMemo(() => {
    const deltas = product.optionGroups.map((g) => {
      const id = selected[g.id];
      return g.choices.find((c) => c.id === id)?.priceDeltaCents ?? 0;
    });
    return unitPriceWithOptions(product.priceCents, deltas);
  }, [product, selected]);

  const multiPickCount = useMemo(
    () => Object.values(perChoiceQty).reduce((s, n) => s + n, 0),
    [perChoiceQty],
  );

  const remaining =
    product.stockQuantity -
    productQtyInCart(readStandCartLines(standSlug), product.id);

  function checkConflicts(extraQty: number): boolean {
    const lines = readStandCartLines(standSlug);
    for (const line of lines) {
      if (line.productId === product.id) continue;
      const other = catalogProducts.find((p) => p.id === line.productId);
      if (!other) continue;
      const msg = cartConflictMessage(product, other);
      if (msg) {
        setError(msg);
        return false;
      }
    }
    if (productQtyInCart(lines, product.id) + extraQty > product.stockQuantity) {
      setError("Not enough left.");
      return false;
    }
    return true;
  }

  function addAndGo(goCart: boolean) {
    setError(null);
    if (product.soldOut) return;

    if (singleGroup) {
      if (multiPickCount < 1) {
        setError("Choose how many of each option you want.");
        return;
      }
      if (!checkConflicts(multiPickCount)) return;
      for (const c of singleGroup.choices) {
        const q = perChoiceQty[c.id] ?? 0;
        if (q > 0) {
          addToStandCart(standSlug, product.id, q, product.stockQuantity, [
            c.id,
          ]);
        }
      }
    } else {
      if (
        product.hasOptions &&
        choiceIds.length !== product.optionGroups.length
      ) {
        setError("Choose an option for each group.");
        return;
      }
      if (!checkConflicts(qty)) return;
      addToStandCart(
        standSlug,
        product.id,
        qty,
        product.stockQuantity,
        choiceIds,
      );
    }

    if (goCart) router.push(standCartPath(standSlug));
    else router.refresh();
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      {product.preOrderDetails ? (
        <PreOrderDetails details={product.preOrderDetails} />
      ) : null}
      {!singleGroup ? (
        <p className="font-receipt text-2xl text-[var(--stand-secondary,var(--ok))]">
          {formatMoney(unitCents, currency)}
        </p>
      ) : null}
      <p className={`font-receipt text-base ${stockTone(product.label)}`}>
        ● {product.label}
      </p>

      {singleGroup ? (
        <ProductMultiChoiceQty
          product={product}
          group={singleGroup}
          currency={currency}
          perChoiceQty={perChoiceQty}
          remaining={remaining}
          onChange={(id, n) =>
            setPerChoiceQty((prev) => ({ ...prev, [id]: n }))
          }
        />
      ) : (
        <>
          {product.optionGroups.map((group) => (
            <fieldset key={group.id} className="flex flex-col gap-2">
              <legend className="text-sm font-medium">{group.name}</legend>
              <div className="flex flex-col gap-2">
                {group.choices.map((c) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-sm has-[:checked]:border-[var(--leaf)]"
                  >
                    <input
                      type="radio"
                      name={`option-${group.id}`}
                      value={c.id}
                      checked={selected[group.id] === c.id}
                      onChange={() =>
                        setSelected((s) => ({ ...s, [group.id]: c.id }))
                      }
                      className="size-4 accent-[var(--leaf)]"
                    />
                    <span className="flex-1 font-medium">
                      {c.name}
                      {c.priceDeltaCents > 0
                        ? ` (+${formatMoney(c.priceDeltaCents, currency)})`
                        : ""}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {!product.soldOut ? (
            <div className="mx-auto">
              <QtyStepper
                value={qty}
                max={Math.max(1, remaining)}
                onChange={(n) => setQty(Math.max(1, n))}
              />
            </div>
          ) : null}
        </>
      )}

      {error ? (
        <p className="text-center text-sm text-[var(--gone)]">{error}</p>
      ) : null}
      <div className="mx-auto flex w-full max-w-xs flex-col items-stretch gap-2">
        <button
          type="button"
          disabled={
            product.soldOut || (singleGroup ? multiPickCount < 1 : false)
          }
          onClick={() => addAndGo(false)}
          className="w-full rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-base font-semibold disabled:opacity-40"
        >
          Add to cart
        </button>
        <button
          type="button"
          disabled={
            product.soldOut || (singleGroup ? multiPickCount < 1 : false)
          }
          onClick={() => addAndGo(true)}
          className="w-full rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-base font-semibold text-white disabled:opacity-40"
        >
          Add &amp; checkout
        </button>
      </div>
    </div>
  );
}
