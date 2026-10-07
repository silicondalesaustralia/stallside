import Image from "next/image";
import Link from "next/link";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import { formatTierSaving, lineTotalWithTiers } from "@/lib/price-tiers";
import { standProductPath } from "@/lib/stand-seo";
import QtyStepper from "../../QtyStepper";

export default function PreOrderPageProductRow({
  standSlug,
  currency,
  product,
  qty,
  remaining,
  onQty,
  showIdentity,
}: {
  standSlug: string;
  currency: string;
  product: PublicProductCard;
  qty: number;
  remaining: number;
  onQty: (n: number) => void;
  showIdentity: boolean;
}) {
  const priced =
    qty > 0
      ? lineTotalWithTiers(product.priceCents, qty, product.priceTiers)
      : null;
  const saveCents =
    priced?.usedTier && qty > 0
      ? formatTierSaving(product.priceCents, qty, priced.lineTotalCents)
      : 0;
  const available = Math.max(0, remaining);

  return (
    <li className="flex flex-col gap-4 border-b border-[var(--line)] py-4 last:border-b-0">
      {showIdentity ? (
        <div className="flex items-start gap-3">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-lg object-cover"
            />
          ) : null}
          <p className="min-w-0 font-medium leading-snug">{product.name}</p>
        </div>
      ) : null}

      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-[28px] font-semibold leading-none tracking-tight">
          {formatMoney(product.priceCents, currency)}
        </span>
        <span className="text-sm text-[var(--muted)]">each</span>
      </p>

      {product.priceTiers.length > 0 ? (
        <details className="group rounded-lg border border-[var(--line)] bg-[var(--wash)] px-3 py-2">
          <summary className="cursor-pointer list-none text-sm font-medium marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-focus)] [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              Quantity savings available
              <span className="text-[var(--muted)] transition group-open:rotate-45" aria-hidden>
                +
              </span>
            </span>
          </summary>
          <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
            {product.priceTiers.map((t) => (
              <li key={t.qty} className="flex justify-between gap-3">
                <span>
                  {t.qty} {t.qty === 1 ? "item" : "items"}
                </span>
                <span className="font-medium text-[var(--field)]">
                  {formatMoney(t.totalCents, currency)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {product.hasOptions ? (
        <Link
          href={standProductPath(standSlug, product.slug)}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--pd-action)] px-4 py-2.5 text-sm font-semibold text-[var(--pd-action)]"
        >
          Choose options
        </Link>
      ) : product.soldOut || remaining <= 0 ? (
        <p className="text-sm text-[var(--gone)]">Sold out</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
              Quantity
            </p>
            <div className="mt-1.5">
              <QtyStepper
                value={qty}
                max={available}
                onChange={onQty}
              />
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {available} available for this collection
          </p>
        </div>
      )}

      {qty > 0 && priced ? (
        <p className="text-sm text-[var(--muted)]">
          {qty} · {formatMoney(priced.lineTotalCents, currency)}
          {saveCents > 0 ? (
            <span className="ml-2 font-medium text-[var(--ok)]">
              Save {formatMoney(saveCents, currency)}
            </span>
          ) : null}
        </p>
      ) : null}
    </li>
  );
}
