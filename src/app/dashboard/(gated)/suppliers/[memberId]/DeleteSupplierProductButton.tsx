"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteSupplierProduct } from "./delete-actions";

export default function DeleteSupplierProductButton({
  memberId,
  productId,
  productName,
}: {
  memberId: string;
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
            `Delete “${productName}” from the stall? It will move to Archived.`,
          )
        ) {
          return;
        }
        setError(null);
        startTransition(async () => {
          const result = await deleteSupplierProduct(formData);
          if (result && "error" in result && result.error) {
            setError(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="memberId" value={memberId} />
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-red-700 underline disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete product"}
      </button>
      {error ? <p className="mt-1 text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
