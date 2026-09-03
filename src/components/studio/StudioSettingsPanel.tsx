"use client";

import { useEditor } from "@craftjs/core";
import { studioSectionLabel } from "@/lib/studio/section-registry";
import ProductPickerField from "@/components/puck/editor/fields/ProductPickerField";
import CategoryPickerField from "@/components/puck/editor/fields/CategoryPickerField";
import { useStudioMetadata } from "./StudioEditorContext";
import type { CraftHeroProps } from "@/components/craft/sections/CraftHeroSection";
import type { CraftProductGridProps } from "@/components/craft/sections/CraftProductGridSection";
import type { CraftNextDropProps } from "@/components/craft/sections/CraftNextDropSection";
import type { CraftAboutProps } from "@/components/craft/sections/CraftAboutSection";
import type { CraftCategoriesProps } from "@/components/studio/sections/CraftCategoriesSection";
import type { CraftTextProps } from "@/components/studio/sections/CraftTextSection";
import type { CraftImageProps } from "@/components/studio/sections/CraftImageSection";
import type { CraftImageTextProps } from "@/components/studio/sections/CraftImageTextSection";

const INPUT =
  "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[var(--field)]">{label}</label>
      {children}
    </div>
  );
}

export default function StudioSettingsPanel() {
  const { actions, selected } = useEditor((state, query) => {
    const ids = Array.from(state.events.selected);
    const id = ids[0] ?? null;
    if (!id) return { selected: null };
    const node = query.node(id).get();
    return {
      selected: {
        id,
        type: node.data.displayName,
        props: node.data.props as Record<string, unknown>,
      },
    };
  });

  if (!selected) {
    return (
      <aside className="vendl-studio-settings vendl-studio-settings--empty">
        <p className="text-sm text-[var(--muted)]">
          Click a section on your website to edit it.
        </p>
      </aside>
    );
  }

  function setProp(key: string, value: unknown) {
    actions.setProp(selected!.id, (props: Record<string, unknown>) => ({
      ...props,
      [key]: value,
    }));
  }

  return (
    <aside className="vendl-studio-settings" role="complementary" aria-label="Section settings">
      <div className="vendl-studio-settings__head">
        <h2 className="text-sm font-bold text-[var(--field)]">
          {studioSectionLabel(selected.type)}
        </h2>
      </div>
      <div className="vendl-studio-settings__body space-y-4">
        {selected.type === "CraftHeroSection" ? (
          <HeroSettings props={selected.props as CraftHeroProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftProductGridSection" ? (
          <ProductGridSettings props={selected.props as CraftProductGridProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftCategoriesSection" ? (
          <CategoriesSettings props={selected.props as CraftCategoriesProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftNextDropSection" ? (
          <NextDropSettings props={selected.props as CraftNextDropProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftTextSection" ? (
          <TextSettings props={selected.props as CraftTextProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftImageSection" ? (
          <ImageSettings props={selected.props as CraftImageProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftImageTextSection" ? (
          <ImageTextSettings props={selected.props as CraftImageTextProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftAboutSection" ? (
          <AboutSettings props={selected.props as CraftAboutProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftProductDetailSection" ? (
          <ProductDetailSettings
            props={selected.props as { showReviews: boolean; showBackLink: boolean }}
            setProp={setProp}
          />
        ) : null}
      </div>
    </aside>
  );
}

function HeroSettings({
  props,
  setProp,
}: {
  props: CraftHeroProps;
  setProp: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="Headline">
        <input className={INPUT} value={props.headline} onChange={(e) => setProp("headline", e.target.value)} />
      </Field>
      <Field label="Text">
        <textarea className={INPUT} rows={3} value={props.supportingText} onChange={(e) => setProp("supportingText", e.target.value)} />
      </Field>
      <Field label="Button">
        <input className={INPUT} value={props.ctaLabel} onChange={(e) => setProp("ctaLabel", e.target.value)} />
      </Field>
      <Field label="Layout">
        <select className={INPUT} value={props.layout} onChange={(e) => setProp("layout", e.target.value)}>
          <option value="simple">Simple</option>
          <option value="split">Split</option>
          <option value="spotlight">Spotlight</option>
          <option value="background">Background</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={props.showCta} onChange={(e) => setProp("showCta", e.target.checked)} />
        Show shop button
      </label>
    </>
  );
}

function ProductGridSettings({
  props,
  setProp,
}: {
  props: CraftProductGridProps;
  setProp: (k: string, v: unknown) => void;
}) {
  const metadata = useStudioMetadata();
  return (
    <>
      <Field label="Show">
        {(["all", "category", "manual", "activeCategory"] as const).map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm">
            <input type="radio" name="source" checked={props.source === opt} onChange={() => setProp("source", opt)} />
            {opt === "all"
              ? "All products"
              : opt === "category"
                ? "A category"
                : opt === "manual"
                  ? "Choose products"
                  : "Current category page"}
          </label>
        ))}
      </Field>
      {props.source === "category" ? (
        <Field label="Category">
          <CategoryPickerField value={props.categoryId} onChange={(v) => setProp("categoryId", v)} categories={metadata.categories} />
        </Field>
      ) : null}
      {props.source === "manual" ? (
        <Field label="Products">
          <ProductPickerField value={props.productIds} onChange={(v) => setProp("productIds", v)} products={metadata.products} />
        </Field>
      ) : null}
      <Field label="Layout">
        <select className={INPUT} value={props.layout} onChange={(e) => setProp("layout", e.target.value)}>
          <option value="grid">Grid</option>
          <option value="list">List</option>
        </select>
      </Field>
      <Field label="Columns">
        <select className={INPUT} value={props.columns} onChange={(e) => setProp("columns", Number(e.target.value))}>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={props.showPrice} onChange={(e) => setProp("showPrice", e.target.checked)} />
        Show prices
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={props.showAvailability} onChange={(e) => setProp("showAvailability", e.target.checked)} />
        Show availability
      </label>
    </>
  );
}

function CategoriesSettings({
  props,
  setProp,
}: {
  props: CraftCategoriesProps;
  setProp: (k: string, v: unknown) => void;
}) {
  const metadata = useStudioMetadata();
  return (
    <>
      <Field label="Heading">
        <input className={INPUT} value={props.heading} onChange={(e) => setProp("heading", e.target.value)} />
      </Field>
      <Field label="Layout">
        <select className={INPUT} value={props.layout} onChange={(e) => setProp("layout", e.target.value)}>
          <option value="tiles">Tiles</option>
          <option value="cards">Cards</option>
          <option value="compact">Compact</option>
        </select>
      </Field>
      <Field label="Show">
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" checked={props.source === "all"} onChange={() => setProp("source", "all")} />
          All categories
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" checked={props.source === "selected"} onChange={() => setProp("source", "selected")} />
          Choose categories
        </label>
      </Field>
      {props.source === "selected" ? (
        <Field label="Categories">
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-[var(--line)] p-2">
            {metadata.categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={props.categoryIds.includes(cat.id)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...props.categoryIds, cat.id]
                      : props.categoryIds.filter((id) => id !== cat.id);
                    setProp("categoryIds", next);
                  }}
                />
                {cat.title}
              </label>
            ))}
          </div>
        </Field>
      ) : null}
    </>
  );
}

function NextDropSettings({
  props,
  setProp,
}: {
  props: CraftNextDropProps;
  setProp: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="Maximum">
        <select className={INPUT} value={props.maxItems} onChange={(e) => setProp("maxItems", Number(e.target.value))}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={props.showClosingDate} onChange={(e) => setProp("showClosingDate", e.target.checked)} />
        Show closing date
      </label>
      <Field label="Layout">
        <select className={INPUT} value={props.cardStyle} onChange={(e) => setProp("cardStyle", e.target.value)}>
          <option value="card">Cards</option>
          <option value="minimal">Compact</option>
        </select>
      </Field>
    </>
  );
}

function TextSettings({
  props,
  setProp,
}: {
  props: CraftTextProps;
  setProp: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="Heading">
        <input className={INPUT} value={props.heading} onChange={(e) => setProp("heading", e.target.value)} />
      </Field>
      <Field label="Text">
        <textarea className={INPUT} rows={5} value={props.body} onChange={(e) => setProp("body", e.target.value)} />
      </Field>
      <Field label="Alignment">
        <select className={INPUT} value={props.alignment} onChange={(e) => setProp("alignment", e.target.value)}>
          <option value="left">Left</option>
          <option value="centre">Centre</option>
        </select>
      </Field>
    </>
  );
}

function ImageSettings({
  props,
  setProp,
}: {
  props: CraftImageProps;
  setProp: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="Image URL">
        <input className={INPUT} value={props.imageUrl} onChange={(e) => setProp("imageUrl", e.target.value)} placeholder="https://…" />
      </Field>
      <Field label="Alt text">
        <input className={INPUT} value={props.alt} onChange={(e) => setProp("alt", e.target.value)} />
      </Field>
      <Field label="Caption">
        <input className={INPUT} value={props.caption} onChange={(e) => setProp("caption", e.target.value)} />
      </Field>
      <Field label="Layout">
        <select className={INPUT} value={props.layout} onChange={(e) => setProp("layout", e.target.value)}>
          <option value="contained">Contained</option>
          <option value="wide">Wide</option>
          <option value="full">Full width</option>
        </select>
      </Field>
    </>
  );
}

function ImageTextSettings({
  props,
  setProp,
}: {
  props: CraftImageTextProps;
  setProp: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="Image URL">
        <input className={INPUT} value={props.imageUrl} onChange={(e) => setProp("imageUrl", e.target.value)} />
      </Field>
      <Field label="Heading">
        <input className={INPUT} value={props.heading} onChange={(e) => setProp("heading", e.target.value)} />
      </Field>
      <Field label="Text">
        <textarea className={INPUT} rows={4} value={props.body} onChange={(e) => setProp("body", e.target.value)} />
      </Field>
      <Field label="Button label">
        <input className={INPUT} value={props.ctaLabel} onChange={(e) => setProp("ctaLabel", e.target.value)} />
      </Field>
      <Field label="Layout">
        <select className={INPUT} value={props.layout} onChange={(e) => setProp("layout", e.target.value)}>
          <option value="image-left">Image left</option>
          <option value="image-right">Image right</option>
          <option value="editorial">Stacked</option>
        </select>
      </Field>
    </>
  );
}

function AboutSettings({
  props,
  setProp,
}: {
  props: CraftAboutProps;
  setProp: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="Heading">
        <input className={INPUT} value={props.heading} onChange={(e) => setProp("heading", e.target.value)} />
      </Field>
      <Field label="Story">
        <textarea className={INPUT} rows={5} value={props.body} onChange={(e) => setProp("body", e.target.value)} />
      </Field>
      <Field label="Layout">
        <select className={INPUT} value={props.layout} onChange={(e) => setProp("layout", e.target.value)}>
          <option value="simple">Simple</option>
          <option value="card">Card</option>
          <option value="editorial">Editorial</option>
        </select>
      </Field>
    </>
  );
}

function ProductDetailSettings({
  props,
  setProp,
}: {
  props: { showReviews: boolean; showBackLink: boolean };
  setProp: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={props.showBackLink}
          onChange={(e) => setProp("showBackLink", e.target.checked)}
        />
        Show back to shop link
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={props.showReviews}
          onChange={(e) => setProp("showReviews", e.target.checked)}
        />
        Show product reviews under detail
      </label>
    </>
  );
}
