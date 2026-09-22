"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteOwnSupplierProduct } from "./delete-product";

export default function SupplyDeleteProductButton({
  standId,
  productId,
  productName,
}: {
  standId: string;
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        if (
          !window.confirm(
            `Delete “${productName}”? The owner will see it under Archived.`,
          )
        ) {
          return;
        }
        setError(null);
        startTransition(async () => {
          const result = await deleteOwnSupplierProduct(formData);
          if (result && "error" in result && result.error) {
            setError(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="standId" value={standId} />
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-red-700 underline disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete product"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
