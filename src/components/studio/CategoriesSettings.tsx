"use client";

import type { CraftCategoriesProps } from "@/components/studio/sections/CraftCategoriesSection";
import { useStudioMetadata } from "@/components/studio/StudioEditorContext";
import { CATEGORY_PRESETS } from "@/lib/studio/preset-registry";
import { categoryLookIsSlim, categoryLookOf } from "@/lib/studio/category-looks";
import PresetStyleField from "./PresetStyleField";

const LABEL = "block text-xs font-semibold text-[var(--field)]";
const CHECK = "flex items-center gap-2 text-sm";

/** Categories section: style, what each card shows, and which categories appear. */
export default function CategoriesSettings({
  props,
  setProp,
}: {
  props: CraftCategoriesProps;
  setProp: (k: string, v: unknown) => void;
}) {
  const metadata = useStudioMetadata();
  const preset = props.preset ?? props.layout;
  const slim = categoryLookIsSlim(categoryLookOf(preset));
  return (
    <>
      <p className="text-xs text-[var(--muted)]">Edit the heading and description directly on the page.</p>
      <PresetStyleField presetsBySkin={CATEGORY_PRESETS} value={preset} onChange={(v) => setProp("preset", v)} />
      <div className="space-y-1.5">
        <span className={LABEL}>On each category</span>
        <label className={CHECK}>
          <input
            type="checkbox"
            checked={props.showDescriptions === true}
            disabled={slim}
            onChange={(e) => setProp("showDescriptions", e.target.checked)}
          />
          Category description
        </label>
        <label className={CHECK}>
          <input
            type="checkbox"
            checked={props.showRatings === true}
            onChange={(e) => setProp("showRatings", e.target.checked)}
          />
          Star rating from reviews
        </label>
        <p className="text-xs text-[var(--muted)]">
          {slim ? "This style has no room for descriptions. " : ""}
          Ratings average the approved reviews of every product in the category. Descriptions come from each
          category&rsquo;s page in the dashboard.
        </p>
      </div>
      <div className="space-y-1.5">
        <span className={LABEL}>Show</span>
        <label className={CHECK}>
          <input type="radio" checked={props.source === "all"} onChange={() => setProp("source", "all")} />
          All categories
        </label>
        <label className={CHECK}>
          <input type="radio" checked={props.source === "selected"} onChange={() => setProp("source", "selected")} />
          Choose categories
        </label>
      </div>
      {props.source === "selected" ? (
        <div className="space-y-1.5">
          <span className={LABEL}>Categories</span>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-[var(--line)] p-2">
            {metadata.categories.map((cat) => (
              <label key={cat.id} className={CHECK}>
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
        </div>
      ) : null}
    </>
  );
}
