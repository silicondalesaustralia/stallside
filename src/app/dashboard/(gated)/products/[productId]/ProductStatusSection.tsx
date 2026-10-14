"use client";

import { useState } from "react";
import DashFormSection from "@/components/DashFormSection";
import ProductLifecycleActions from "../ProductLifecycleActions";
import ProductPublicCard from "./ProductPublicCard";
import type { ProductFields } from "./product-edit-fields";

const STATUS = {
  live: { label: "On sale", note: "Shown in your shop.", tone: "bg-[var(--wash)] text-[var(--leaf-dark)]" },
  hidden: { label: "Hidden", note: "Not listed in your shop - the direct link still works.", tone: "bg-amber-100 text-amber-900" },
  archived: { label: "Archived", note: "Not in your shop. Restore it to sell again.", tone: "bg-[var(--gone)]/10 text-[var(--gone)]" },
} as const;

/** Whether the product is on sale, its public link, and hide/duplicate/archive (these apply straight away). */
export default function ProductStatusSection({ product }: { product: ProductFields }) {
  const [error, setError] = useState<string | null>(null);
  const status = STATUS[product.isArchived ? "archived" : product.isHidden ? "hidden" : "live"];

  return (
    <DashFormSection title="Status">
      <div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
        <p className="mt-2 text-sm text-[var(--muted)]">{status.note}</p>
      </div>
      {!product.isArchived ? (
        <ProductPublicCard publicUrl={product.publicUrl} standSlug={product.standSlug} slug={product.slug} onError={setError} />
      ) : null}
      <div className="border-t border-[var(--line)] pt-3">
        <ProductLifecycleActions
          productId={product.id}
          productName={product.name}
          isHidden={product.isHidden}
          isArchived={product.isArchived}
        />
      </div>
      {error ? <p className="text-xs text-[var(--gone)]">{error}</p> : null}
    </DashFormSection>
  );
}
