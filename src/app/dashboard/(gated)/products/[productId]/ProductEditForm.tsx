"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import FilePickButton from "@/components/FilePickButton";
import { updateProduct } from "../actions";
import PreOrderFields from "../PreOrderFields";

type ProductFields = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  priceCents: number;
  currency: string;
  lowStockThreshold: number;
  standName: string;
  standSlug: string;
  publicUrl: string;
  cardTier: boolean;
  stripeConnected: boolean;
  isPreOrder: boolean;
  orderByAt: Date | null;
  collectionAt: Date | null;
  collectionNote: string | null;
  showExactStock: boolean;
};

export default function ProductEditForm({ product }: { product: ProductFields }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
      {product.cardTier ? (
        <PreOrderFields
          key={[
            product.isPreOrder ? "1" : "0",
            product.showExactStock ? "1" : "0",
            product.orderByAt?.toISOString() ?? "",
            product.collectionAt?.toISOString() ?? "",
            product.collectionNote ?? "",
            product.stripeConnected ? "1" : "0",
          ].join("|")}
          stripeConnected={product.stripeConnected}
          defaultIsPreOrder={product.isPreOrder}
          defaultOrderByAt={product.orderByAt}
          defaultCollectionAt={product.collectionAt}
          defaultCollectionNote={product.collectionNote}
          defaultShowExactStock={product.showExactStock}
        />
      ) : null}
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
