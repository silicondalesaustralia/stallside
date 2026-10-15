import type { StudioTemplateId } from "./types";
import { mapProductPreset, type ProductPreset } from "./preset-registry";

export type ProductGridLook = {
  card: "editorial" | "classic" | "featured" | "compact";
  dense: boolean;
  farm: boolean;
  /** Fixed grid for presets that set their own columns; null means the section's column setting applies. */
  presetGrid: string | null;
};

/** How a product card style (Style setting) looks: card shape, spacing, wash background and its own columns. */
export function productGridLook(templateId: StudioTemplateId, preset: ProductPreset): ProductGridLook {
  const card = mapProductPreset(templateId, preset);
  const dense = templateId === "market" || preset === "dense" || preset === "list";
  const farm = templateId === "farmhouse" || preset === "farm-grid" || preset === "availability";
  const presetGrid =
    card === "compact" || dense
      ? "grid-cols-2 sf-sm:grid-cols-3 sf-lg:grid-cols-4 sf-xl:grid-cols-5"
      : card === "featured"
        ? "grid-cols-1 sf-sm:grid-cols-2"
        : null;
  return { card, dense, farm, presetGrid };
}
