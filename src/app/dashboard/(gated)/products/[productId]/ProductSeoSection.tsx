"use client";

import { useState } from "react";
import DashFormSection from "@/components/DashFormSection";
import { richTextToPlain } from "@/lib/website/rich-text/plain";
import type { ProductFields } from "./product-edit-fields";

const INPUT = "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5";

/** How the product shows in Google and link previews, plus its web address. */
export default function ProductSeoSection({ product }: { product: ProductFields }) {
  const [slug, setSlug] = useState(product.slug);
  const [title, setTitle] = useState(product.seoTitle ?? "");
  const [description, setDescription] = useState(product.seoDescription ?? "");
  const base = product.publicUrl.slice(0, product.publicUrl.length - product.slug.length);
  const previewDescription = description || richTextToPlain(product.description).slice(0, 160);

  return (
    <DashFormSection title="Search engine listing">
      <div className="rounded-xl border border-[var(--line)] bg-white p-4">
        <p className="truncate text-xs text-[#4d5156]">{`${base}${slug}`}</p>
        <p className="mt-1 truncate text-lg text-[#1a0dab]">{title || product.name}</p>
        <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">
          {previewDescription || "Add a description so shoppers know what they're clicking."}
        </p>
      </div>
      <details className="group">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--leaf-dark)] underline">
          Edit search listing and web address
        </summary>
        <div className="mt-3 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Page title</span>
            <input name="seoTitle" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder={product.name} className={INPUT} />
            <span className="text-xs text-[var(--muted)]">{title.length} / 120 · Leave blank to use the product name.</span>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Meta description</span>
            <textarea
              name="seoDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Leave blank to use the start of the description."
              className={INPUT}
            />
            <span className="text-xs text-[var(--muted)]">{description.length} / 300</span>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">URL handle</span>
            <input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} maxLength={60} className={`${INPUT} font-receipt`} />
            <span className="text-xs text-[var(--muted)]">Changing this updates the link. Old links redirect.</span>
          </label>
        </div>
      </details>
    </DashFormSection>
  );
}
