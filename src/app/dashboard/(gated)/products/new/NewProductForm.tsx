"use client";

import { useState, useTransition } from "react";
import DashFormSection from "@/components/DashFormSection";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { createProduct } from "../actions";
import ProductOwnerMetaFields from "../ProductOwnerMetaFields";
import NewProductDetailsFields from "./NewProductDetailsFields";
import NewProductSellWhereFields from "./NewProductSellWhereFields";

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
  defaultShowOnline,
}: {
  stands: StandOption[];
  defaultStandId?: string;
  defaultCurrency: string;
  defaultShowOnline: boolean;
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
      <DashFormSection
        title="Where you sell"
        hint="Choose where this product can appear. You can change this later."
        span
      >
        <NewProductSellWhereFields
          stands={stands}
          defaultStandId={defaultStandId}
          defaultShowOnline={defaultShowOnline}
        />
      </DashFormSection>

      <DashFormSection title="Details">
        <NewProductDetailsFields onImageBusyChange={setImageBusy} />
      </DashFormSection>

      <DashFormSection title="Price & stock">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Price</span>
          <input
            name="price"
            required
            inputMode="decimal"
            placeholder="6.00"
            className={inputClass}
          />
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
            <span className="font-medium">Starting stock / max pre-orders</span>
            <input
              name="stockQuantity"
              type="number"
              min={0}
              defaultValue={0}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Low-stock threshold</span>
            <input
              name="lowStockThreshold"
              type="number"
              min={0}
              defaultValue={5}
              className={inputClass}
            />
          </label>
        </div>
      </DashFormSection>

      <DashFormSection title="Search" span>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">SEO title (optional)</span>
            <input name="seoTitle" maxLength={120} className={inputClass} />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">SEO description (optional)</span>
            <textarea
              name="seoDescription"
              maxLength={300}
              rows={2}
              className={inputClass}
            />
          </label>
        </div>
      </DashFormSection>

      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}
        <button
          type="submit"
          disabled={pending || imageBusy}
          className={dashCtaClass}
        >
          {pending ? "Saving…" : imageBusy ? "Preparing photo…" : "Save product"}
        </button>
      </div>
    </form>
  );
}
