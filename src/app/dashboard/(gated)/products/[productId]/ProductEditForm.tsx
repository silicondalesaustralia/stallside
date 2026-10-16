"use client";

import { useRouter, unstable_rethrow } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { useFormDirty } from "@/components/useFormDirty";
import ProductBasicsSection from "./ProductBasicsSection";
import ProductPhotosCard from "./ProductPhotosCard";
import ProductPricingSection from "./ProductPricingSection";
import ProductOptionsEditor, { savedOptionsJson } from "./ProductOptionsEditor";
import ProductUpsellFields from "./ProductUpsellFields";
import ProductSeoSection from "./ProductSeoSection";
import ProductStatusSection from "./ProductStatusSection";
import ProductInventorySection from "./ProductInventorySection";
import ProductFulfilmentSection from "./ProductFulfilmentSection";
import ProductOrganisationSection from "./ProductOrganisationSection";
import ProductSaveBar, { type SaveNotice } from "./ProductSaveBar";
import { saveProductForm } from "./save-product-form";
import type { ProductFields } from "./product-edit-fields";

/** The whole product editor: main details on the left, status/stock/organisation on the right, one Save bar. */
export default function ProductEditForm({
  product,
  initialImageError,
}: {
  product: ProductFields;
  initialImageError?: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const { dirty, markSaved } = useFormDirty(formRef, resetKey);
  const [notice, setNotice] = useState<SaveNotice | null>(
    initialImageError ? { tone: "error", text: initialImageError } : null,
  );
  const [preOrderEligible, setPreOrderEligible] = useState(product.preOrderEligible);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setNotice(null);
    startTransition(async () => {
      try {
        const error = await saveProductForm(product.id, savedOptionsJson(product.options), formData);
        if (error) {
          setNotice({ tone: "error", text: error });
          return;
        }
        markSaved();
        setNotice({ tone: "ok", text: "Saved" });
        router.refresh();
      } catch (err) {
        unstable_rethrow(err);
        console.error("Product save failed", err);
        setNotice({ tone: "error", text: err instanceof Error ? err.message : "Could not save product. Try again." });
      }
    });
  }

  function discard() {
    if (!window.confirm("Discard your unsaved changes?")) return;
    setPreOrderEligible(product.preOrderEligible);
    setNotice(null);
    setResetKey((k) => k + 1);
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5">
      <div key={resetKey} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <ProductBasicsSection name={product.name} description={product.description} />
          <ProductPhotosCard productId={product.id} productName={product.name} photos={product.photos} alts={product.photoAlts} />
          <ProductPricingSection product={product} />
          <ProductOptionsEditor initial={product.options} disabled={product.priceTiers.length > 0} />
          {!preOrderEligible ? (
            <section className="dash-card p-5">
              <ProductUpsellFields
                currency={product.currency}
                products={product.siblingProducts}
                upsellProductId={product.upsellProductId}
                upsellPriceCents={product.upsellPriceCents}
              />
            </section>
          ) : null}
          <ProductSeoSection product={product} />
        </div>
        <aside className="flex min-w-0 flex-col gap-5">
          <ProductStatusSection product={product} />
          <ProductInventorySection product={product} />
          <ProductFulfilmentSection
            value={product.fulfilment}
            standDefault={product.standFulfilmentDefault}
            preOrderEligible={preOrderEligible}
            shippingCents={product.shippingCents}
            shippingMode={product.standShippingMode}
            currency={product.currency}
          />
          <ProductOrganisationSection
            categories={product.categories}
            primaryCategoryId={product.primaryCategoryId}
            freshnessNote={product.freshnessNote}
            showPreOrder={product.cardTier}
            preOrderEligible={preOrderEligible}
            onPreOrderChange={setPreOrderEligible}
          />
        </aside>
      </div>
      <ProductSaveBar dirty={dirty} pending={pending} notice={notice} onDiscard={discard} />
    </form>
  );
}
