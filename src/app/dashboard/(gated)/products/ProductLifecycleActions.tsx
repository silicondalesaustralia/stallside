"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  archiveProduct,
  duplicateProduct,
  restoreProduct,
  setProductHidden,
} from "./product-lifecycle-actions";

export default function ProductLifecycleActions({
  productId,
  productName,
  isHidden,
  isArchived,
}: {
  productId: string;
  productName: string;
  isHidden: boolean;
  isArchived: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string } | void>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result && "error" in result && result.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch (err) {
        if (
          typeof err === "object" &&
          err !== null &&
          "digest" in err &&
          String((err as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
        ) {
          throw err;
        }
        console.error(err);
        setError("Something went wrong. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3 text-sm">
        {!isArchived ? (
          <>
            <button
              type="button"
              disabled={pending}
              className="font-semibold text-[var(--leaf-dark)] underline disabled:opacity-60"
              onClick={() => run(() => duplicateProduct(productId))}
            >
              Duplicate
            </button>
            <button
              type="button"
              disabled={pending}
              className="font-semibold text-[var(--leaf-dark)] underline disabled:opacity-60"
              onClick={() => run(() => setProductHidden(productId, !isHidden))}
            >
              {isHidden ? "Show on stand" : "Hide on stand"}
            </button>
            <button
              type="button"
              disabled={pending}
              className="font-semibold text-[var(--warn)] underline disabled:opacity-60"
              onClick={() => {
                if (
                  !window.confirm(
                    `Archive “${productName}”? It leaves the stand but you can restore it anytime.`,
                  )
                ) {
                  return;
                }
                run(() => archiveProduct(productId));
              }}
            >
              Archive
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={pending}
            className="font-semibold text-[var(--leaf-dark)] underline disabled:opacity-60"
            onClick={() => run(() => restoreProduct(productId))}
          >
            Restore
          </button>
        )}
      </div>
      {error ? <p className="text-xs text-[var(--gone)]">{error}</p> : null}
    </div>
  );
}
