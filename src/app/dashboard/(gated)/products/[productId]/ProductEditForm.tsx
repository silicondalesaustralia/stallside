"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import DashFormSection from "@/components/DashFormSection";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { updateProduct } from "../actions";
import ProductDetailsFields from "./ProductDetailsFields";
import ProductPriceTiersFields from "./ProductPriceTiersFields";
import ProductPublicCard from "./ProductPublicCard";
import ProductUpsellFields from "./ProductUpsellFields";
import ProductOwnerMetaFields from "../ProductOwnerMetaFields";
import type { ProductFields } from "./product-edit-fields";

const inputClass =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5";

export default function ProductEditForm({
  product,
}: {
  product: ProductFields;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [preOrderEligible, setPreOrderEligible] = useState(
    product.preOrderEligible,
  );
  const [pending, startTransition] = useTransition();
  const save = updateProduct.bind(null, product.id);
  const priceDefault = (product.priceCents / 100).toFixed(2);

  function onSubmit(formData: FormData) {
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
    <form action={onSubmit} className="grid gap-5 lg:grid-cols-2">
      <DashFormSection title="Details">
        <ProductDetailsFields
          name={product.name}
          slug={product.slug}
          freshnessNote={product.freshnessNote}
          description={product.description}
          imageUrl={product.imageUrl}
        />
      </DashFormSection>

      <DashFormSection title="Listing" hint={`Stand: ${product.standName}`}>
        <ProductPublicCard
          publicUrl={product.publicUrl}
          standSlug={product.standSlug}
          slug={product.slug}
          onError={setMessage}
        />
        {product.cardTier ? (
          <label className="flex items-start gap-3 text-sm">
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
                Add this to a{" "}
                <Link
                  href="/dashboard/pre-order-pages"
                  className="text-[var(--leaf-dark)] underline"
                >
                  pre-order page
                </Link>
                . Collection day is set on the page.
              </span>
            </span>
          </label>
        ) : null}
      </DashFormSection>

      <DashFormSection title="Price">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Price ({product.currency})</span>
          <input
            name="price"
            required
            inputMode="decimal"
            defaultValue={priceDefault}
            className={inputClass}
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
      </DashFormSection>

      <DashFormSection title="Stock & extras">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Low-stock threshold</span>
          <input
            name="lowStockThreshold"
            type="number"
            min={0}
            defaultValue={product.lowStockThreshold}
            className={inputClass}
          />
        </label>
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
          <span className="font-medium">SEO title (optional)</span>
          <input
            name="seoTitle"
            defaultValue={product.seoTitle ?? ""}
            maxLength={120}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">SEO description (optional)</span>
          <textarea
            name="seoDescription"
            defaultValue={product.seoDescription ?? ""}
            maxLength={300}
            rows={2}
            className={inputClass}
          />
        </label>
      </DashFormSection>

      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        {message ? (
          <p
            className={`text-sm ${
              message === "Saved."
                ? "text-[var(--leaf-dark)]"
                : "text-[var(--warn)]"
            }`}
          >
            {message}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className={dashCtaClass}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href="/dashboard/inventory"
          className="rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-bold"
        >
          Adjust stock
        </Link>
      </div>
    </form>
  );
}
