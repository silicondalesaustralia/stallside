"use client";

import { useEditor } from "@craftjs/core";
import { craftSectionLabel } from "@/lib/craft/section-registry";
import ProductPickerField from "@/components/puck/editor/fields/ProductPickerField";
import CategoryPickerField from "@/components/puck/editor/fields/CategoryPickerField";
import { useCraftMetadata } from "./CraftEditorContext";
import type { CraftHeroProps } from "./sections/CraftHeroSection";
import type { CraftProductGridProps } from "./sections/CraftProductGridSection";
import type { CraftNextDropProps } from "./sections/CraftNextDropSection";
import type { CraftAboutProps } from "./sections/CraftAboutSection";

const INPUT =
  "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

export default function CraftSettingsDrawer() {
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

  if (!selected) return null;

  function setProp(key: string, value: unknown) {
    actions.setProp(selected!.id, (props: Record<string, unknown>) => ({
      ...props,
      [key]: value,
    }));
  }

  function close() {
    actions.selectNode(undefined);
  }

  return (
    <div className="vendl-settings-overlay" role="dialog" aria-label="Edit section">
      <button type="button" aria-label="Close" className="vendl-settings-overlay__backdrop" onClick={close} />
      <div className="vendl-settings-overlay__panel">
        <div className="vendl-settings-overlay__header">
          <h2 className="text-sm font-bold text-[var(--field)]">
            {craftSectionLabel(selected.type)}
          </h2>
          <button type="button" onClick={close} className="rounded-lg bg-[var(--field)] px-3 py-1 text-xs font-semibold text-white">
            Done
          </button>
        </div>
        <div className="vendl-settings-overlay__body space-y-4">
          {selected.type === "CraftHeroSection" ? (
            <HeroSettings props={selected.props as CraftHeroProps} setProp={setProp} />
          ) : null}
          {selected.type === "CraftProductGridSection" ? (
            <ProductGridSettings props={selected.props as CraftProductGridProps} setProp={setProp} />
          ) : null}
          {selected.type === "CraftNextDropSection" ? (
            <NextDropSettings props={selected.props as CraftNextDropProps} setProp={setProp} />
          ) : null}
          {selected.type === "CraftAboutSection" ? (
            <AboutSettings props={selected.props as CraftAboutProps} setProp={setProp} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[var(--field)]">{label}</label>
      {children}
    </div>
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
  const metadata = useCraftMetadata();
  return (
    <>
      <Field label="Show">
        {(["all", "category", "manual"] as const).map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm">
            <input type="radio" name="source" checked={props.source === opt} onChange={() => setProp("source", opt)} />
            {opt === "all" ? "All products" : opt === "category" ? "A category" : "Choose products"}
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
        </select>
      </Field>
    </>
  );
}
