"use client";

import type { CraftHeroProps } from "@/components/craft/sections/CraftHeroSection";
import ButtonLinkField from "@/components/studio/ButtonLinkField";
import SectionImageField from "@/components/studio/SectionImageField";
import SiteChoice from "@/components/studio/SiteChoice";
import { useStudioMetadata } from "@/components/studio/StudioEditorContext";
import { heroPickerValue, resolveHeroStyle } from "@/lib/studio/hero-styles";
import { parseHeroLook } from "@/lib/studio/hero-look";
import type { HeroFacts } from "@/lib/studio/hero-needs";
import { countdownMenu } from "./HeroCountdown";
import HeroStylePicker from "./HeroStylePicker";
import HeroLookFields from "./HeroLookFields";
import ImageStyleField from "@/components/studio/ImageStyleField";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";
const LABEL = "block text-xs font-semibold text-[var(--field)]";

/** Hero section: style, photo, buttons and look. */
export default function HeroSettings({
  props,
  setProp,
}: {
  props: CraftHeroProps;
  setProp: (k: string, v: unknown) => void;
}) {
  const meta = useStudioMetadata();
  const image = props.decorativeImageUrl || props.imageUrl || "";
  const look = parseHeroLook(props);
  const style = resolveHeroStyle(meta.templateId, props.layout);
  const pairable = style === "split" || style === "produce-split";
  const facts: HeroFacts = {
    hasPhoto: Boolean(image || meta.branding.heroImageUrl),
    productCount: meta.products.length,
    categoryCount: meta.categories.length,
    hasMenu: meta.menus.length > 0,
    hasCountdownMenu: Boolean(countdownMenu(meta)),
    hasHours: Boolean(meta.standHours),
  };
  return (
    <>
      <p className="text-xs text-[var(--muted)]">Edit the headline and text directly on the page.</p>
      <HeroStylePicker value={heroPickerValue(meta.templateId, props.layout)} facts={facts} onChange={(v) => setProp("layout", v)} />
      <SectionImageField
        label={pairable && look.imageStyle === "pair" ? "Main photo (back)" : "Image"}
        value={image}
        onChange={(url) => {
          setProp("imageUrl", url);
          setProp("decorativeImageUrl", "");
        }}
        fallbackUrl={meta.branding.heroImageUrl}
        fallbackLabel="Using the hero image from Branding."
      />
      {pairable ? (
        <ImageStyleField imageStyle={props.imageStyle} secondImageUrl={props.secondImageUrl} setProp={setProp} />
      ) : null}
      <HeroLookFields style={style} look={look} setProp={setProp} />
      <SiteChoice
        label="Width"
        options={["full", "contained"] as const}
        labels={{ full: "Full width", contained: "Contained" }}
        value={props.width ?? "full"}
        onChange={(v) => setProp("width", v)}
      />
      <div className="space-y-1.5">
        <label className={LABEL}>Button</label>
        <input className={INPUT} value={props.ctaLabel} onChange={(e) => setProp("ctaLabel", e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={props.showCta} onChange={(e) => setProp("showCta", e.target.checked)} />
        Show main button
      </label>
      <div className="space-y-1.5">
        <label className={LABEL}>Second button (optional)</label>
        <input
          className={INPUT}
          value={props.secondaryLabel ?? ""}
          maxLength={40}
          placeholder="e.g. Get directions"
          onChange={(e) => setProp("secondaryLabel", e.target.value)}
        />
      </div>
      {props.secondaryLabel?.trim() ? (
        <ButtonLinkField
          value={props.secondaryLink}
          label="Second button link"
          defaultLabel={null}
          onChange={(v) => setProp("secondaryLink", v)}
        />
      ) : null}
    </>
  );
}
