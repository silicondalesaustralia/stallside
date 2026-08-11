"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import FilePickButton from "@/components/FilePickButton";
import { updateProduct } from "../actions";
import ProductPriceTiersFields from "./ProductPriceTiersFields";
import ProductUpsellFields from "./ProductUpsellFields";
import ProductOwnerMetaFields from "../ProductOwnerMetaFields";
import type { PriceTier } from "@/lib/price-tiers";

type ProductFields = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  priceCents: number;
  costCents: number | null;
  sku: string | null;
  upc: string | null;
  currency: string;
  lowStockThreshold: number;
  standId: string;
  standName: string;
  standSlug: string;
  publicUrl: string;
  cardTier: boolean;
  preOrderEligible: boolean;
  freshnessNote: string | null;
  priceTiers: PriceTier[];
  hasOptions: boolean;
  upsellProductId: string | null;
  upsellPriceCents: number | null;
  siblingProducts: { id: string; name: string; priceCents: number }[];
};

export default function ProductEditForm({ product }: { product: ProductFields }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [preOrderEligible, setPreOrderEligible] = useState(
    product.preOrderEligible,
  );
  const [pending, startTransition] = useTransition();
  const save = updateProduct.bind(null, product.id);
  const priceDefault = (product.priceCents / 100).toFixed(2);

  function onSubmit(formData: FormData) {
    // Snapshot before transition - React may reset the live FormData (files + fields).
    const payload = new FormData();
    for (const [key, value] of formData.entries()) {
      payload.append(key, value);
    }
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await save(payload);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
          return;
        }
        setMessage("Saved.");
        router.refresh();
      } catch (error) {
        console.error("Product save failed", error);
        setMessage("Could not save product. Try again.");
      }
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-[var(--muted)]">Stand: {product.standName}</p>
      {product.cardTier ? (
        <label className="flex items-start gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
          <input
            type="checkbox"
            name="preOrderEligible"
            checked={preOrderEligible}
            onChange={(e) => setPreOrderEligible(e.target.checked)}
            className="mt-0.5 size-4"
          />
          <span>
            <span className="font-medium">Available for pre-order pages</span>
            <span className="mt-1 block text-[var(--muted)]">
              Lets you add this product to a{" "}
              <Link
                href="/dashboard/pre-order-pages"
                className="text-[var(--leaf-dark)] underline"
              >
                pre-order page
              </Link>
              . Collection day and pre-order add-ons are set on the page, not
              here.
            </span>
          </span>
        </label>
      ) : null}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3 text-sm">
        <p className="font-medium">Public page</p>
        <p className="mt-1 break-all text-[var(--muted)]">{product.publicUrl}</p>
        <button
          type="button"
          className="mt-2 text-[var(--leaf-dark)] underline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(product.publicUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              setMessage("Could not copy link.");
            }
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        {" · "}
        <Link
          href={`/s/${product.standSlug}/${product.slug}`}
          target="_blank"
          className="text-[var(--leaf-dark)] underline"
        >
          Open
        </Link>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Product name</span>
        <input
          name="name"
          required
          defaultValue={product.name}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">URL slug</span>
        <input
          name="slug"
          required
          defaultValue={product.slug}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 font-receipt"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Description (optional)</span>
        <input
          name="description"
          defaultValue={product.description ?? ""}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      {product.imageUrl ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt=""
            className="h-16 w-16 rounded-lg object-cover"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="clearImage" className="size-4" />
            Remove image
          </label>
        </div>
      ) : null}
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Product image</span>
        <FilePickButton
          name="image"
          accept="image/jpeg,image/png,image/webp"
          label="Choose image"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Price ({product.currency})</span>
        <input
          name="price"
          required
          inputMode="decimal"
          defaultValue={priceDefault}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <ProductOwnerMetaFields
        currency={product.currency}
        sku={product.sku}
        upc={product.upc}
        costCents={product.costCents}
        priceCents={product.priceCents}
      />
      <ProductPriceTiersFields
        currency={product.currency}
        initial={product.priceTiers}
        disabled={product.hasOptions}
      />
      {!preOrderEligible ? (
        <ProductUpsellFields
          currency={product.currency}
          businessId={product.standId}
          products={product.siblingProducts}
          upsellProductId={product.upsellProductId}
          upsellPriceCents={product.upsellPriceCents}
        />
      ) : null}
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Freshness note (optional)</span>
        <input
          name="freshnessNote"
          defaultValue={product.freshnessNote ?? ""}
          maxLength={80}
          placeholder="Laid this morning"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Low-stock threshold</span>
        <input
          name="lowStockThreshold"
          type="number"
          min={0}
          defaultValue={product.lowStockThreshold}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">SEO title (optional)</span>
        <input
          name="seoTitle"
          defaultValue={product.seoTitle ?? ""}
          maxLength={120}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">SEO description (optional)</span>
        <textarea
          name="seoDescription"
          defaultValue={product.seoDescription ?? ""}
          maxLength={300}
          rows={2}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      {message ? (
        <p
          className={`text-sm ${
            message === "Saved." ? "text-[var(--leaf-dark)]" : "text-[var(--warn)]"
          }`}
        >
          {message}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href="/dashboard/inventory"
          className="rounded-lg border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--field)]"
        >
          Adjust stock
        </Link>
      </div>
    </form>
  );
}
