"use client";

import { useState, useTransition, type FormEvent } from "react";
import PreOrderFields from "../products/PreOrderFields";
import { createMenu, updateMenu } from "./actions";

const MENU_ALWAYS = "ALWAYS_AVAILABLE";
const MENU_DROP = "PREORDER_DROP";

type ProductOpt = {
  id: string;
  name: string;
  priceCents: number;
};

const inputClass =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5";

export default function MenuForm({
  products,
  stripeConnected,
  currency: _currency,
  timeZone,
  values,
}: {
  products: ProductOpt[];
  stripeConnected: boolean;
  currency: string;
  timeZone: string;
  values?: {
    id?: string;
    title: string;
    slug: string;
    description: string | null;
    kind: "ALWAYS_AVAILABLE" | "PREORDER_DROP";
    isActive: boolean;
    hideOnBusinessPage: boolean;
    showOnStand: boolean;
    showOnShop: boolean;
    orderByAt: string;
    collectionAt: string;
    collectionNote: string | null;
    showExactStock: boolean;
    paymentTiming: "PAY_UPFRONT" | "DEPOSIT_THEN_BALANCE" | "PAY_NOW";
    depositPercent: number | null;
    handoverMode: "COLLECT" | "DELIVER";
    productIds: string[];
  };
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [kind, setKind] = useState<"ALWAYS_AVAILABLE" | "PREORDER_DROP">(
    values?.kind ?? MENU_ALWAYS,
  );
  const editing = Boolean(values?.id);
  const selected = new Set(values?.productIds ?? []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = new FormData(event.currentTarget);
    payload.set("kind", kind);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = editing
          ? await updateMenu(values!.id!, payload)
          : await createMenu(payload);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
        }
      } catch (error) {
        console.error("Menu save failed", error);
        setMessage(
          error instanceof Error ? error.message : "Could not save menu.",
        );
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6">
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Title</span>
        <input
          name="title"
          required
          defaultValue={values?.title ?? ""}
          className={inputClass}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">URL slug</span>
        <input
          name="slug"
          defaultValue={values?.slug ?? ""}
          placeholder="saturday-bake-box"
          className={inputClass}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Description</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={values?.description ?? ""}
          className={inputClass}
        />
      </label>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Menu type</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="kindChoice"
            checked={kind === MENU_ALWAYS}
            onChange={() => setKind(MENU_ALWAYS)}
          />
          Always available — curated take-now list
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="kindChoice"
            checked={kind === MENU_DROP}
            onChange={() => setKind(MENU_DROP)}
          />
          Pre-order drop — scheduled collection or delivery
        </label>
      </fieldset>

      {kind === MENU_DROP ? (
        <PreOrderFields
          stripeConnected={stripeConnected}
          forceOn
          timeZone={timeZone}
          defaultOrderByAt={values?.orderByAt || null}
          defaultCollectionAt={values?.collectionAt || null}
          defaultCollectionNote={values?.collectionNote ?? null}
          defaultShowExactStock={values?.showExactStock ?? false}
          defaultDepositRequired={
            values?.paymentTiming === "DEPOSIT_THEN_BALANCE"
          }
          defaultDepositPercent={values?.depositPercent ?? 30}
          defaultHandoverMode={values?.handoverMode ?? "COLLECT"}
        />
      ) : null}

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Products</legend>
        {products.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Add products first.</p>
        ) : (
          products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="productIds"
                value={p.id}
                defaultChecked={selected.has(p.id)}
              />
              {p.name}
            </label>
          ))
        )}
      </fieldset>

      <fieldset className="grid gap-2 text-sm">
        <legend className="font-medium">Visibility</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={values?.isActive ?? true}
          />
          Active
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="hideOnBusinessPage"
            defaultChecked={values?.hideOnBusinessPage ?? false}
          />
          Hide products from stand catalog / QR grid
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="showOnStand"
            defaultChecked={values?.showOnStand ?? true}
          />
          Show on stand menu pages
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="showOnShop"
            defaultChecked={values?.showOnShop ?? true}
          />
          Show on online shop
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : editing ? "Save menu" : "Create menu"}
      </button>
      {message ? <p className="text-sm text-[var(--gone)]">{message}</p> : null}
    </form>
  );
}
