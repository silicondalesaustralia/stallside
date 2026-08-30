"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import PreOrderAddonFields from "@/components/PreOrderAddonFields";
import PreOrderFields from "../products/PreOrderFields";
import PreOrderShareFields from "./PreOrderShareFields";
import {
  createPreOrderPage,
  updatePreOrderPage,
} from "./actions";

type ProductOpt = {
  id: string;
  name: string;
  priceCents: number;
  hasOptions: boolean;
};

type PageValues = {
  id?: string;
  updatedAt?: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  hideOnBusinessPage: boolean;
  orderByAt: string;
  collectionAt: string;
  collectionNote: string | null;
  showExactStock: boolean;
  paymentTiming: "PAY_UPFRONT" | "DEPOSIT_THEN_BALANCE" | "PAY_NOW";
  depositPercent: number | null;
  handoverMode: "COLLECT" | "DELIVER";
  productIds: string[];
  preOrderUpsellName: string | null;
  preOrderUpsellPriceCents: number | null;
  preOrderUpsellDiscountKind: string | null;
  preOrderUpsellDiscountValue: number | null;
};

export default function PreOrderPageForm({
  products,
  stripeConnected,
  currency,
  values,
}: {
  products: ProductOpt[];
  stripeConnected: boolean;
  currency: string;
  values?: PageValues;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [imageBusy, setImageBusy] = useState(false);
  const editing = Boolean(values?.id);
  const selected = new Set(values?.productIds ?? []);

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
        const result = editing
          ? await updatePreOrderPage(values!.id!, payload)
          : await createPreOrderPage(payload);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
          return;
        }
        if (editing) {
          setMessage("Saved.");
          router.refresh();
        }
      } catch (error) {
        console.error("Pre-order page save failed", error);
        setMessage("Could not save. Try again.");
      }
    });
  }

  return (
    <form
      key={values?.updatedAt ?? values?.id ?? "new"}
      action={onSubmit}
      className="grid w-full gap-4 lg:grid-cols-2"
    >
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={values?.isActive ?? true}
          className="size-4"
        />
        Page is live
      </label>
      <label className="flex items-start gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
        <input
          type="checkbox"
          name="hideOnBusinessPage"
          defaultChecked={values?.hideOnBusinessPage ?? true}
          className="mt-0.5 size-4"
        />
        <span>
          <span className="font-medium">Hide on business page</span>
          <span className="mt-1 block text-[var(--muted)]">
            Keep these products off the main business catalog and business QR.
            Customers use this page&apos;s link or QR instead.
          </span>
        </span>
      </label>

      <div className="lg:col-span-2">
        <PreOrderFields
          forceOn
          stripeConnected={stripeConnected}
          defaultIsPreOrder
          defaultOrderByAt={values?.orderByAt ?? null}
          defaultCollectionAt={values?.collectionAt ?? null}
          defaultCollectionNote={values?.collectionNote ?? null}
          defaultShowExactStock={values?.showExactStock ?? false}
          defaultDepositRequired={
            values?.paymentTiming === "DEPOSIT_THEN_BALANCE"
          }
          defaultDepositPercent={values?.depositPercent ?? 30}
          defaultHandoverMode={values?.handoverMode ?? "COLLECT"}
        />
      </div>

      <fieldset className="flex flex-col gap-2 rounded-lg border border-[var(--line)] p-4 lg:col-span-2">
        <legend className="px-1 text-sm font-medium">Products on this page</legend>
        <p className="text-sm text-[var(--muted)]">
          Only products marked “Available for pre-order pages” appear here.
          They share this page&apos;s collection day. Items with options open
          their own product page for choices.
        </p>
        {products.length === 0 ? (
          <p className="text-sm text-[var(--warn)]">
            Mark products as available for pre-order pages on the product
            editor, then come back.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {products.map((p) => (
              <label key={p.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="productIds"
                  value={p.id}
                  defaultChecked={selected.has(p.id)}
                  className="mt-0.5 size-4"
                />
                <span>
                  {p.name}
                  {p.hasOptions ? (
                    <span className="text-[var(--muted)]"> (has options)</span>
                  ) : null}
                </span>
              </label>
            ))}
          </ul>
        )}
      </fieldset>

      <div className="lg:col-span-2">
        <PreOrderAddonFields
          currency={currency}
          name={values?.preOrderUpsellName ?? null}
          priceCents={values?.preOrderUpsellPriceCents ?? null}
          discountKind={values?.preOrderUpsellDiscountKind ?? null}
          discountValue={values?.preOrderUpsellDiscountValue ?? null}
          intro="Optional cart add-on for this page. Offered when the cart is this pre-order sheet. Inherits collection day and payment settings."
        />
      </div>

      <PreOrderShareFields
        title={values?.title ?? ""}
        slug={values?.slug ?? ""}
        description={values?.description ?? null}
        imageUrl={values?.imageUrl ?? null}
        onImageBusyChange={setImageBusy}
      />

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
        <button
          type="submit"
          disabled={pending || imageBusy || !stripeConnected}
          className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
        >
          {pending
            ? "Saving…"
            : imageBusy
              ? "Preparing photo…"
              : editing
                ? "Save page"
                : "Create page"}
        </button>
      </div>
    </form>
  );
}
