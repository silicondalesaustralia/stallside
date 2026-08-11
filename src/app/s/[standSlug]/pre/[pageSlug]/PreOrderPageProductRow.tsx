import Link from "next/link";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import { formatTierSaving, lineTotalWithTiers } from "@/lib/price-tiers";
import { standProductPath } from "@/lib/stand-seo";
import QtyStepper from "../../QtyStepper";

function liveLeftLabel(label: string, left: number): string {
  if (left <= 0) {
    return label
      .replace(/^(Only )?\d+ left/, "Sold out")
      .replace(/^\d+ left/, "Sold out");
  }
  return label
    .replace(/^\d+ left/, `${left} left`)
    .replace(/^Only \d+ left/, `Only ${left} left`);
}

export default function PreOrderPageProductRow({
  standSlug,
  currency,
  product,
  qty,
  remaining,
  onQty,
}: {
  standSlug: string;
  currency: string;
  product: PublicProductCard;
  qty: number;
  remaining: number;
  onQty: (n: number) => void;
}) {
  const effectiveQty = qty > 0 ? qty : 1;
  const priced = lineTotalWithTiers(
    product.priceCents,
    effectiveQty,
    product.priceTiers,
  );
  const saveCents =
    priced.usedTier && qty > 0
      ? formatTierSaving(
          product.priceCents,
          qty,
          priced.lineTotalCents,
        )
      : 0;
  const leftNow = Math.max(0, remaining - qty);
  const stockLabel = liveLeftLabel(product.label, leftNow);

  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex items-start gap-3">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            className="size-20 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div
            className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-[var(--wash)] px-1 text-center"
            aria-hidden
          >
            <span className="font-[family-name:var(--font-display)] text-xs font-bold leading-tight text-[var(--field)]">
              {product.name}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {qty > 0 ? `${qty} × ` : null}
            {product.name}
          </p>
          <p className="mt-1 font-receipt text-lg text-[var(--stand-secondary,var(--ok))]">
            {formatMoney(priced.lineTotalCents, currency)}
            {qty > 1 ? (
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
          <p className="mt-1 text-sm text-[var(--muted)]">{stockLabel}</p>
        </div>
      </div>
      <div className="flex justify-end">
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
            onChange={onQty}
          />
        )}
      </div>
    </li>
  );
}
