"use client";

import ProductPickerField from "@/components/puck/editor/fields/ProductPickerField";
import CategoryPickerField from "@/components/puck/editor/fields/CategoryPickerField";
import type { CraftProductGridProps } from "@/components/craft/sections/CraftProductGridSection";
import { categoryPageSource, isCategoryPage } from "@/lib/studio/product-grid-pool";
import { useStudioMetadata } from "./StudioEditorContext";

const GENERAL_SOURCES = { all: "All products", category: "A category", manual: "Choose products" } as const;
const CATEGORY_SOURCES = { activeCategory: "All category products", manual: "Selected category products" } as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[var(--field)]">{label}</label>
      {children}
    </div>
  );
}

function SourceRadios<K extends string>({
  options,
  value,
  onChange,
}: {
  options: Record<K, string>;
  value: K;
  onChange: (v: K) => void;
}) {
  return (
    <Field label="Show">
      {(Object.keys(options) as K[]).map((opt) => (
        <label key={opt} className="flex items-center gap-2 text-sm">
          <input type="radio" name="source" checked={value === opt} onChange={() => onChange(opt)} />
          {options[opt]}
        </label>
      ))}
    </Field>
  );
}

/** Which products the grid shows. Category pages are limited to the current category's products. */
export default function ProductGridSourceField({
  props,
  setProp,
}: {
  props: CraftProductGridProps;
  setProp: (k: string, v: unknown) => void;
}) {
  const metadata = useStudioMetadata();

  if (isCategoryPage(metadata)) {
    const source = categoryPageSource(props.source);
    const categorised = metadata.products.filter((p) => p.categoryIds.length > 0);
    return (
      <>
        <p className="text-xs text-[var(--muted)]">
          This layout is used by every category. The title and description come from each category&apos;s settings in
          the dashboard.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={props.showCategoryIntro !== false}
            onChange={(e) => setProp("showCategoryIntro", e.target.checked)}
          />
          Show category title &amp; description
        </label>
        <SourceRadios options={CATEGORY_SOURCES} value={source} onChange={(v) => setProp("source", v)} />
        {source === "manual" ? (
          <Field label="Products">
            <ProductPickerField value={props.productIds} onChange={(v) => setProp("productIds", v)} products={categorised} />
            <p className="text-xs text-[var(--muted)]">
              Each category page only shows the chosen products that belong to that category.
            </p>
          </Field>
        ) : null}
      </>
    );
  }

  const source = props.source === "activeCategory" ? "all" : props.source;
  return (
    <>
      <p className="text-xs text-[var(--muted)]">Edit the heading directly on the page.</p>
      <SourceRadios options={GENERAL_SOURCES} value={source} onChange={(v) => setProp("source", v)} />
      {source === "category" ? (
        <Field label="Category">
          <CategoryPickerField value={props.categoryId} onChange={(v) => setProp("categoryId", v)} categories={metadata.categories} />
        </Field>
      ) : null}
      {source === "manual" ? (
        <Field label="Products">
          <ProductPickerField value={props.productIds} onChange={(v) => setProp("productIds", v)} products={metadata.products} />
        </Field>
      ) : null}
    </>
  );
}
