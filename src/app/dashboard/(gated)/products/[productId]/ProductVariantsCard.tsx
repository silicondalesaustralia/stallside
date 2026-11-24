"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import DashFormSection from "@/components/DashFormSection";
import {
  buildCombinations,
  draftToPayload,
  type DraftOption,
  type DraftVariant,
} from "@/lib/product-variants/variant-draft";
import { saveProductVariants } from "../product-variants-actions";
import VariantOptionFields from "./VariantOptionFields";
import VariantRowsTable from "./VariantRowsTable";

export default function ProductVariantsCard({
  productId,
  defaultPrice,
  initialOptions,
  initialVariants,
  blockedReason,
}: {
  productId: string;
  defaultPrice: string;
  initialOptions: DraftOption[];
  initialVariants: DraftVariant[];
  blockedReason: string | null;
}) {
  const router = useRouter();
  const [options, setOptions] = useState(initialOptions);
  const [rows, setRows] = useState(initialVariants);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveProductVariants(productId, draftToPayload(options, rows));
      if ("error" in result) {
        setMessage(result.error ?? "Could not save variants.");
        return;
      }
      setMessage("Variants saved.");
      router.refresh();
    });
  }

  return (
    <DashFormSection
      title="Variants"
      hint={
        blockedReason ??
        "Example: T-shirt sizes S / M / L, each with its own price, SKU and stock count. Product stock is the total of every variant. Use Add-on options above when choices share one stock pool (like flavour on a cake)."
      }
    >
      <fieldset disabled={Boolean(blockedReason)} className="flex flex-col gap-3 disabled:opacity-60">
        <VariantOptionFields options={options} onChange={setOptions} />
        <button
          type="button"
          className="self-start rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold"
          onClick={() => setRows(buildCombinations(options, rows, defaultPrice))}
        >
          {rows.length ? "Update variant list" : "Create variants"}
        </button>
        <VariantRowsTable rows={rows} onChange={setRows} />
        {message ? (
          <p
            className={`text-sm ${
              message === "Variants saved." ? "text-[var(--leaf-dark)]" : "text-[var(--warn)]"
            }`}
          >
            {message}
          </p>
        ) : null}
        <button
          type="button"
          disabled={pending}
          onClick={onSave}
          className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save variants"}
        </button>
      </fieldset>
    </DashFormSection>
  );
}
