"use client";

import Link from "next/link";
import { Link2, Trash2 } from "lucide-react";

/** One library photo with product link controls. */
export default function MediaLibraryAssetCard({
  asset,
  products,
  productId,
  busy,
  onProductChange,
  onLink,
  onRemove,
}: {
  asset: { id: string; url: string; fileName: string };
  products: { id: string; name: string }[];
  productId: string;
  busy: boolean;
  onProductChange: (productId: string) => void;
  onLink: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="dash-card flex flex-col gap-2 overflow-hidden p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset.url} alt="" className="aspect-square w-full rounded-lg object-cover" />
      <p className="truncate text-xs font-medium text-[var(--field)]" title={asset.fileName}>
        {asset.fileName}
      </p>
      <label className="sr-only" htmlFor={`link-${asset.id}`}>
        Product for {asset.fileName}
      </label>
      <select
        id={`link-${asset.id}`}
        className="rounded-md border border-[var(--line)] bg-white px-2 py-1 text-xs"
        disabled={busy || products.length === 0}
        value={productId}
        onChange={(e) => onProductChange(e.target.value)}
      >
        <option value="">Link to product…</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={busy || !productId}
          onClick={onLink}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-[var(--wash)] px-2 py-1 text-xs font-semibold text-[var(--leaf-dark)] disabled:opacity-50"
        >
          <Link2 className="size-3.5" aria-hidden />
          Link
        </button>
        <button
          type="button"
          disabled={busy}
          aria-label={`Remove ${asset.fileName}`}
          onClick={onRemove}
          className="rounded-md border border-[var(--line)] px-2 py-1 text-[var(--muted)] hover:text-[var(--gone)] disabled:opacity-50"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      </div>
      {productId ? (
        <Link href={`/dashboard/products/${productId}`} className="text-[10px] text-[var(--leaf-dark)] underline">
          Open product
        </Link>
      ) : null}
    </li>
  );
}
