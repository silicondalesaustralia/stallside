"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { archiveProduct, duplicateProduct, restoreProduct } from "./product-lifecycle-actions";
import { deleteProductForever } from "./product-delete-action";

const LINK = "font-semibold text-[var(--leaf-dark)] underline disabled:opacity-60";

/** Duplicate, Publish/Unpublish (unpublished products are drafts) and Delete. */
export default function ProductLifecycleActions({
  productId,
  productName,
  isArchived,
  isSupplier = false,
  compact = false,
}: {
  productId: string;
  productName: string;
  isArchived: boolean;
  /** Supplier products are deleted from Suppliers, not here. */
  isSupplier?: boolean;
  /** Text-only actions for table rows. */
  compact?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string } | { ok: true } | void>) {
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
        setError(
          err instanceof Error && err.message
            ? err.message
            : "Something went wrong. Try again.",
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={`flex items-center text-sm ${compact ? "justify-end gap-3 whitespace-nowrap" : "flex-wrap gap-3"}`}>
        <button type="button" disabled={pending} className={LINK} onClick={() => run(() => duplicateProduct(productId))}>
          Duplicate
        </button>
        <button
          type="button"
          disabled={pending}
          className={LINK}
          onClick={() => run(() => (isArchived ? restoreProduct(productId) : archiveProduct(productId)))}
        >
          {isArchived ? "Publish" : "Unpublish"}
        </button>
        {!isSupplier ? (
          <button
            type="button"
            disabled={pending}
            className={
              compact
                ? "font-semibold text-[var(--gone)] underline disabled:opacity-60"
                : "rounded-full bg-[var(--gone)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--gone)] disabled:opacity-60"
            }
            onClick={() => {
              if (!window.confirm(`Delete “${productName}” for good? This can't be undone.`)) return;
              run(async () => {
                const result = await deleteProductForever(productId);
                if ("ok" in result && pathname !== "/dashboard/products") router.push("/dashboard/products");
                return result;
              });
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-[var(--gone)]">{error}</p> : null}
    </div>
  );
}
