"use client";

import { useEditor } from "@craftjs/core";
import { studioSectionRule } from "@/lib/studio/section-registry";
import {
  BODY_SIZES,
  CARD_SECTIONS,
  HEADING_SIZES,
  HEADING_TAGS,
  PHOTO_SECTIONS,
  PHOTO_SHAPE_SECTIONS,
  defaultHeadingTag,
  parseSectionStyle,
  type HeadingTag,
  type SectionStyle,
} from "@/lib/website/sections/section-style";
import { hasLowContrast, type ThemePalette } from "@/lib/website/sections/colour";
import { countPageH1, h1Warning } from "@/lib/website/sections/heading-outline";
import ColourField from "./ColourField";
import PhotoStyleFields from "./PhotoStyleFields";
import SectionImageLayoutFields from "./SectionImageLayoutFields";
const SIZE_LABELS: Record<string, string> = { sm: "S", md: "M", lg: "L", xl: "XL" };
const PILL = "rounded-lg border px-2.5 py-1.5 text-xs font-semibold";
const PILL_ON = "border-[var(--field)] bg-[var(--wash)] text-[var(--field)]";
const PILL_OFF = "border-[var(--line)] text-[var(--muted)]";

/** Colour and typography settings shared by every section. */
export default function SectionStyleSettings({
  craftName,
  rawStyle,
  onChange,
  palette,
}: {
  craftName: string;
  rawStyle: unknown;
  onChange: (next: SectionStyle) => void;
  palette: ThemePalette;
}) {
  const style = parseSectionStyle(rawStyle);
  const { h1Count } = useEditor((state) => ({
    h1Count: countPageH1(
      Object.values(state.nodes)
        .filter((n) => studioSectionRule(n.data.displayName))
        .map((n) => ({ craftName: n.data.displayName, style: (n.data.props as Record<string, unknown>).style })),
    ),
  }));
  const defaultTag = defaultHeadingTag(craftName);
  const headingWarning = h1Warning(h1Count);

  function patch<K extends keyof SectionStyle>(key: K, value: SectionStyle[K] | undefined) {
    const next: SectionStyle = { ...style };
    if (value === undefined) delete next[key];
    else next[key] = value;
    onChange(next);
  }

  function sizeRow<K extends "headingSize" | "bodySize">(key: K, sizes: readonly NonNullable<SectionStyle[K]>[]) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={`${PILL} ${!style[key] ? PILL_ON : PILL_OFF}`} onClick={() => patch(key, undefined)}>
          Default
        </button>
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            className={`${PILL} ${style[key] === size ? PILL_ON : PILL_OFF}`}
            onClick={() => patch(key, size)}
          >
            {SIZE_LABELS[size]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ColourField label="Background" value={style.background} onChange={(v) => patch("background", v)} palette={palette} noneLabel="None (template default)" />
      <ColourField label="Heading colour" value={style.headingColour} onChange={(v) => patch("headingColour", v)} palette={palette} noneLabel="Auto (readable on the background)" />
      <ColourField label="Text colour" value={style.textColour} onChange={(v) => patch("textColour", v)} palette={palette} noneLabel="Auto (readable on the background)" />
      {hasLowContrast(style, palette) ? (
        <p className="text-xs text-red-700">Text may be hard to read on this background. Try Auto text colour.</p>
      ) : null}
      {CARD_SECTIONS.has(craftName) ? (
        <>
          <ColourField label="Card background" value={style.cardBackground} onChange={(v) => patch("cardBackground", v)} palette={palette} noneLabel="None (template default)" />
          <ColourField label="Card text colour" value={style.cardTextColour} onChange={(v) => patch("cardTextColour", v)} palette={palette} noneLabel="Auto (readable on the card)" />
          {style.cardBackground && hasLowContrast({ background: style.cardBackground, textColour: style.cardTextColour }, palette) ? (
            <p className="text-xs text-red-700">Card text may be hard to read. Try Auto card text colour.</p>
          ) : null}
        </>
      ) : null}
      <SectionImageLayoutFields
        craftName={craftName}
        imageRadius={style.imageRadius}
        swapSides={style.swapSides}
        onRadius={(v) => patch("imageRadius", v)}
        onSwap={(v) => patch("swapSides", v || undefined)}
      />
      {PHOTO_SECTIONS.has(craftName) ? (
        <PhotoStyleFields
          idPrefix="section"
          value={style}
          onChange={patch}
          showShape={PHOTO_SHAPE_SECTIONS.has(craftName)}
          defaultLabel="Site default"
          palette={palette}
        />
      ) : null}
      <div className="space-y-1.5">
        <p className="block text-xs font-semibold text-[var(--field)]">Heading size</p>
        {sizeRow("headingSize", HEADING_SIZES)}
      </div>
      <div className="space-y-1.5">
        <p className="block text-xs font-semibold text-[var(--field)]">Text size</p>
        {sizeRow("bodySize", BODY_SIZES)}
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--field)]" htmlFor="section-heading-tag">
          Heading tag
        </label>
        <select
          id="section-heading-tag"
          className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          value={style.headingTag ?? ""}
          onChange={(e) => patch("headingTag", (e.target.value || undefined) as HeadingTag | undefined)}
        >
          <option value="">Default ({defaultTag.toUpperCase()})</option>
          {HEADING_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag.toUpperCase()}
            </option>
          ))}
        </select>
        <p className="text-xs text-[var(--muted)]">For search engines and screen readers. Size is set separately above.</p>
        {headingWarning ? <p className="text-xs text-amber-700">{headingWarning}</p> : null}
      </div>
    </div>
  );
}
