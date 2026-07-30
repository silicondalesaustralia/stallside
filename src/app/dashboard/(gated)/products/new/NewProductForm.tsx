"use client";

import { useState, useTransition } from "react";
import FilePickButton from "@/components/FilePickButton";
import { createProduct } from "../actions";
import PreOrderFields from "../PreOrderFields";

type StandOption = { id: string; name: string };

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export default function NewProductForm({
  stands,
  defaultStandId,
  cardTier,
}: {
  stands: StandOption[];
  defaultStandId?: string;
  cardTier: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
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
    <form action={onSubmit} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Stand</span>
        <select
          name="standId"
          defaultValue={defaultStandId ?? stands[0]?.id}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        >
          {stands.map((stand) => (
            <option key={stand.id} value={stand.id}>
              {stand.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Product name</span>
        <input
          name="name"
          required
          placeholder="Dozen eggs"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">URL slug (optional)</span>
        <input
          name="slug"
          placeholder="auto from name"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 font-receipt"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Description (optional)</span>
        <input
          name="description"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Product image (optional)</span>
        <FilePickButton
          name="image"
          accept="image/jpeg,image/png,image/webp"
          label="Choose image"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Price</span>
        <input
          name="price"
          required
          inputMode="decimal"
          placeholder="6.00"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">
          {cardTier ? "Starting stock / max pre-orders" : "Starting stock"}
        </span>
        <input
          name="stockQuantity"
          type="number"
          min={0}
          defaultValue={0}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Low-stock threshold</span>
        <input
          name="lowStockThreshold"
          type="number"
          min={0}
          defaultValue={5}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">SEO title (optional)</span>
        <input
          name="seoTitle"
          maxLength={120}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">SEO description (optional)</span>
        <textarea
          name="seoDescription"
          maxLength={300}
          rows={2}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      {cardTier ? <PreOrderFields /> : null}
      {message ? (
        <p className="text-sm text-[var(--warn)]">{message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
