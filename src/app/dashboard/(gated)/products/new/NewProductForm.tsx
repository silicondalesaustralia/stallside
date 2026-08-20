"use client";

import { useState, useTransition } from "react";
import FilePickButton from "@/components/FilePickButton";
import DashFormSection from "@/components/DashFormSection";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { createProduct } from "../actions";
import ProductOwnerMetaFields from "../ProductOwnerMetaFields";
import {
  PRODUCT_IMAGE_HINT,
  PRODUCT_IMAGE_MAX_BYTES,
} from "@/lib/image-upload-limits";

type StandOption = { id: string; name: string; currency: string };

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

const inputClass =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5";

export default function NewProductForm({
  stands,
  defaultStandId,
  defaultCurrency,
  cardTier,
}: {
  stands: StandOption[];
  defaultStandId?: string;
  defaultCurrency: string;
  cardTier: boolean;
  stripeConnected: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    if (imageBusy) {
      setMessage("Wait for the photo to finish preparing, then save.");
      return;
    }
    const payload = new FormData();
    for (const [key, value] of formData.entries()) {
      payload.append(key, value);
    }
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await createProduct(payload);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
        }
      } catch (error) {
        if (isNextRedirect(error)) throw error;
        console.error("Create product failed", error);
        setMessage(
          error instanceof Error ? error.message : "Could not save product.",
        );
      }
    });
  }

  return (
    <form action={onSubmit} className="grid gap-5 lg:grid-cols-2">
      <DashFormSection title="Details">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Stand</span>
          <select
            name="standId"
            defaultValue={defaultStandId ?? stands[0]?.id}
            className={inputClass}
          >
            {stands.map((stand) => (
              <option key={stand.id} value={stand.id}>
                {stand.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm sm:col-span-2">
            <span className="font-medium">Product name</span>
            <input name="name" required placeholder="Dozen eggs" className={inputClass} />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">URL slug (optional)</span>
            <input name="slug" placeholder="auto from name" className={`${inputClass} font-receipt`} />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Product image</span>
            <FilePickButton
              name="image"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              label="Choose image"
              maxBytes={PRODUCT_IMAGE_MAX_BYTES}
              hint={PRODUCT_IMAGE_HINT}
              onBusyChange={setImageBusy}
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Description (optional)</span>
          <input name="description" className={inputClass} />
        </label>
      </DashFormSection>

      <DashFormSection title="Price & stock">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Price</span>
          <input name="price" required inputMode="decimal" placeholder="6.00" className={inputClass} />
        </label>
        <ProductOwnerMetaFields
          currency={defaultCurrency}
          sku={null}
          upc={null}
          costCents={null}
          priceCents={0}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">
              {cardTier ? "Starting stock / max pre-orders" : "Starting stock"}
            </span>
            <input name="stockQuantity" type="number" min={0} defaultValue={0} className={inputClass} />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Low-stock threshold</span>
            <input name="lowStockThreshold" type="number" min={0} defaultValue={5} className={inputClass} />
          </label>
        </div>
        {cardTier ? (
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="preOrderEligible" className="mt-0.5 size-4" />
            <span>
              <span className="font-medium">Available for pre-order pages</span>
              <span className="mt-1 block text-[var(--muted)]">
                You can add this to a pre-order page after saving.
              </span>
            </span>
          </label>
        ) : null}
      </DashFormSection>

      <DashFormSection title="Search" span>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">SEO title (optional)</span>
            <input name="seoTitle" maxLength={120} className={inputClass} />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">SEO description (optional)</span>
            <textarea name="seoDescription" maxLength={300} rows={2} className={inputClass} />
          </label>
        </div>
      </DashFormSection>

      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}
        <button type="submit" disabled={pending || imageBusy} className={dashCtaClass}>
          {pending ? "Saving…" : imageBusy ? "Preparing photo…" : "Save product"}
        </button>
      </div>
    </form>
  );
}
