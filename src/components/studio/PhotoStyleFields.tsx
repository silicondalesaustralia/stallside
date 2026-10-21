"use client";

import {
  PHOTO_FITS,
  PHOTO_FIT_LABELS,
  PHOTO_FOCI,
  PHOTO_FOCUS_LABELS,
  PHOTO_SHAPES,
  PHOTO_SHAPE_LABELS,
  type PhotoStyle,
} from "@/lib/website/sections/photo-style";
import type { ThemePalette } from "@/lib/website/sections/colour";
import SiteStyleSelect from "./SiteStyleSelect";
import ColourField from "./ColourField";

type Props = {
  idPrefix: string;
  value: PhotoStyle;
  onChange: <K extends keyof PhotoStyle>(key: K, value: PhotoStyle[K]) => void;
  showShape: boolean;
  defaultLabel: string;
  palette: ThemePalette;
};

/** Photo fit, focus point and (where the frame can change) shape. */
export default function PhotoStyleFields({ idPrefix, value, onChange, showShape, defaultLabel, palette }: Props) {
  return (
    <div className="space-y-3">
      <SiteStyleSelect
        id={`${idPrefix}-photo-fit`}
        label="Photo fit"
        options={PHOTO_FITS}
        labels={PHOTO_FIT_LABELS}
        value={value.photoFit}
        onChange={(v) => onChange("photoFit", v)}
        defaultLabel={defaultLabel}
      />
      <SiteStyleSelect
        id={`${idPrefix}-photo-focus`}
        label="Keep in view when cropped"
        options={PHOTO_FOCI}
        labels={PHOTO_FOCUS_LABELS}
        value={value.photoFocus}
        onChange={(v) => onChange("photoFocus", v)}
        defaultLabel={defaultLabel}
      />
      {showShape ? (
        <SiteStyleSelect
          id={`${idPrefix}-photo-shape`}
          label="Card photo shape"
          options={PHOTO_SHAPES}
          labels={PHOTO_SHAPE_LABELS}
          value={value.photoShape}
          onChange={(v) => onChange("photoShape", v)}
          defaultLabel={defaultLabel}
        />
      ) : null}
      <ColourField
        label="Photo background"
        value={value.photoBackground}
        onChange={(v) => onChange("photoBackground", v)}
        palette={palette}
        noneLabel={defaultLabel}
      />
      <p className="text-xs text-[var(--muted)]">
        &ldquo;Show whole photo&rdquo; never cuts anything off; the photo background fills the space around it.
      </p>
    </div>
  );
}
