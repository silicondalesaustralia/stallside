"use client";

import { useEffect, useState } from "react";
import { useEditor } from "@craftjs/core";
import { studioSectionLabel } from "@/lib/studio/section-registry";
import ProductPickerField from "@/components/puck/editor/fields/ProductPickerField";
import CategoryPickerField from "@/components/puck/editor/fields/CategoryPickerField";
import { useStudioMetadata, useStudioEditorChrome } from "./StudioEditorContext";
import HeaderStyleSettings from "./HeaderStyleSettings";
import PresetStyleField from "./PresetStyleField";
import SectionImageField from "./SectionImageField";
import SectionStyleSettings from "./SectionStyleSettings";
import SettingsGroup from "./SettingsGroup";
import SectionImageLayoutFields from "./SectionImageLayoutFields";
import { BUTTON_SECTIONS, parseSectionStyle, type SectionStyle } from "@/lib/website/sections/section-style";
import SectionButtonFields from "./SectionButtonFields";
import SectionElementStyles from "./SectionElementStyles";
import { sectionElements } from "@/lib/website/sections/section-elements";
import ButtonLinkField from "./ButtonLinkField";
import { LINKABLE_BUTTON_SECTIONS } from "@/lib/studio/button-link";
import PageStyleSettings from "./PageStyleSettings";
import SiteButtonSettings from "./SiteButtonSettings";
import SiteLinkSettings from "./SiteLinkSettings";
import SiteTypographySettings from "./SiteTypographySettings";
import SiteLayoutSettings from "./SiteLayoutSettings";
import ProductDetailSettings from "./ProductDetailSettings";
import type { CraftProductDetailProps } from "@/components/studio/sections/CraftProductDetailSection";
import type { CraftCategoryDetailProps } from "@/components/studio/sections/CraftCategoryDetailSection";
import CategoryDetailSettings from "@/components/studio/CategoryDetailSettings";
import type { CraftSpacerProps } from "@/components/studio/sections/CraftSpacerSection";
import SpacerSettings from "@/components/studio/SpacerSettings";
import ReviewsSettings from "@/components/studio/ReviewsSettings";
import type { CraftReviewsProps } from "@/components/studio/sections/CraftReviewsSection";
import SiteCardsEffectsSettings from "./SiteCardsEffectsSettings";
import SiteStyleSaveStatus from "./SiteStyleSaveStatus";
import SiteSharingSettings from "./SiteSharingSettings";
import FooterSettingsPanel from "./FooterSettingsPanel";
import { paletteOf } from "@/lib/website/sections/colour";
import { CATEGORY_PRESETS, NEXT_DROP_PRESETS, PRODUCT_PRESETS } from "@/lib/studio/preset-registry";
import type { CraftHeroProps } from "@/components/craft/sections/CraftHeroSection";
import type { CraftProductGridProps } from "@/components/craft/sections/CraftProductGridSection";
import type { CraftNextDropProps } from "@/components/craft/sections/CraftNextDropSection";
import type { CraftAboutProps } from "@/components/craft/sections/CraftAboutSection";
import type { CraftCategoriesProps } from "@/components/studio/sections/CraftCategoriesSection";
import type { CraftTextProps } from "@/components/studio/sections/CraftTextSection";
import type { CraftImageProps } from "@/components/studio/sections/CraftImageSection";
import type { CraftImageTextProps } from "@/components/studio/sections/CraftImageTextSection";
import type { CraftPaymentsProps } from "@/components/studio/sections/CraftPaymentsSection";
import PaymentsSettings from "./PaymentsSettings";
import ImageSectionSettings from "./ImageSectionSettings";
import FaqSettings from "./FaqSettings";
import type { CraftFaqProps } from "@/components/studio/sections/CraftFaqSection";
import ContactFormSettings from "./ContactFormSettings";
import type { CraftContactFormProps } from "@/components/studio/sections/CraftContactFormSection";

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
  const { chromeTarget, setChromeTarget } = useStudioEditorChrome();
  const metadata = useStudioMetadata();
  const [openGroups, setOpenGroups] = useState({ content: true, button: false, elements: false, style: false });
  const toggleGroup = (group: keyof typeof openGroups, open: boolean) =>
    setOpenGroups((prev) => ({ ...prev, [group]: open }));
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

  useEffect(() => {
    if (selected && chromeTarget) {
      setChromeTarget?.(null);
    }
  }, [selected, chromeTarget, setChromeTarget]);

  if (chromeTarget === "footer") return <FooterSettingsPanel />;
  if (chromeTarget) {
    return <HeaderStyleSettings key={chromeTarget} focus={chromeTarget} />;
  }

  if (!selected) {
    return (
      <aside className="vendl-studio-settings vendl-studio-settings--empty" aria-label="Site Wide Edits">
        <h2 className="text-sm font-bold text-[var(--field)]">Site Wide Edits</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          These apply to every page. Click the header, footer or a section to edit just that part.
        </p>
        <button
          type="button"
          className="mt-3 text-left text-sm font-semibold text-[var(--field)] underline"
          onClick={() => {
            actions.selectNode(undefined);
            setChromeTarget?.("header");
          }}
        >
          Edit header, menu &amp; announcement bar
        </button>
        <button
          type="button"
          className="mt-2 text-left text-sm font-semibold text-[var(--field)] underline"
          onClick={() => {
            actions.selectNode(undefined);
            setChromeTarget?.("footer");
          }}
        >
          Edit footer
        </button>
        <SiteTypographySettings />
        <SiteLayoutSettings />
        <SiteCardsEffectsSettings />
        <SiteStyleSaveStatus />
        <PageStyleSettings />
        <SiteButtonSettings />
        <SiteLinkSettings />
        <SiteSharingSettings />
      </aside>
    );
  }

  function setProp(key: string, value: unknown) {
    actions.setProp(selected!.id, (props: Record<string, unknown>) => {
      props[key] = value;
    });
  }

  const sectionStyle = parseSectionStyle(selected.props.style);
  function setStyleField<K extends keyof SectionStyle>(key: K, value: SectionStyle[K] | undefined) {
    const next: SectionStyle = { ...sectionStyle };
    if (value === undefined) delete next[key];
    else next[key] = value;
    setProp("style", next);
  }

  return (
    <aside className="vendl-studio-settings" role="complementary" aria-label="Section settings">
      <div className="vendl-studio-settings__head">
        <h2 className="text-sm font-bold text-[var(--field)]">
          {studioSectionLabel(selected.type)}
        </h2>
      </div>
      <div className="vendl-studio-settings__body">
        <SettingsGroup title="Content" open={openGroups.content} onToggle={(o) => toggleGroup("content", o)}>
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
        {selected.type === "CraftFaqSection" ? (
          <FaqSettings props={selected.props as CraftFaqProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftContactFormSection" ? (
          <ContactFormSettings props={selected.props as CraftContactFormProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftImageSection" ? (
          <ImageSectionSettings props={selected.props as CraftImageProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftImageTextSection" ? (
          <ImageTextSettings props={selected.props as CraftImageTextProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftPaymentsSection" ? (
          <PaymentsSettings props={selected.props as CraftPaymentsProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftAboutSection" ? (
          <AboutSettings props={selected.props as CraftAboutProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftProductDetailSection" ? (
          <ProductDetailSettings
            props={selected.props as CraftProductDetailProps}
            setProp={setProp}
          />
        ) : null}
        {selected.type === "CraftReviewsSection" ? (
          <ReviewsSettings props={selected.props as CraftReviewsProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftSpacerSection" ? (
          <SpacerSettings props={selected.props as CraftSpacerProps} setProp={setProp} />
        ) : null}
        {selected.type === "CraftCategoryDetailSection" ? (
          <CategoryDetailSettings props={selected.props as CraftCategoryDetailProps} setProp={setProp} />
        ) : null}
        {LINKABLE_BUTTON_SECTIONS.has(selected.type) ? (
          <ButtonLinkField
            key={selected.id}
            value={typeof selected.props.buttonLink === "string" ? selected.props.buttonLink : undefined}
            defaultLabel={selected.type === "CraftImageTextSection" ? "no link" : "Shop"}
            onChange={(v) => setProp("buttonLink", v)}
          />
        ) : null}
        <SectionImageLayoutFields
          craftName={selected.type}
          imageRadius={sectionStyle.imageRadius}
          swapSides={sectionStyle.swapSides}
          onRadius={(v) => setStyleField("imageRadius", v)}
          onSwap={(v) => setStyleField("swapSides", v || undefined)}
        />
        </SettingsGroup>
        {BUTTON_SECTIONS.has(selected.type) ? (
          <SettingsGroup title="Button" open={openGroups.button} onToggle={(o) => toggleGroup("button", o)}>
            <SectionButtonFields
              style={sectionStyle}
              palette={paletteOf(metadata.resolvedBranding)}
              setField={setStyleField}
            />
          </SettingsGroup>
        ) : null}
        {sectionElements(selected.type).length ? (
          <SettingsGroup title="Text elements" open={openGroups.elements} onToggle={(o) => toggleGroup("elements", o)}>
            <SectionElementStyles
              elements={sectionElements(selected.type)}
              value={sectionStyle.elements}
              onChange={(v) => setStyleField("elements", v)}
              palette={paletteOf(metadata.resolvedBranding)}
            />
          </SettingsGroup>
        ) : null}
        <SettingsGroup title="Style" open={openGroups.style} onToggle={(o) => toggleGroup("style", o)}>
          <SectionStyleSettings
            craftName={selected.type}
            rawStyle={selected.props.style}
            onChange={(next) => setProp("style", next)}
            palette={paletteOf(metadata.resolvedBranding)}
          />
        </SettingsGroup>
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
  const brandingHero = useStudioMetadata().branding.heroImageUrl;
  return (
    <>
      <p className="text-xs text-[var(--muted)]">
        Edit the headline and text directly on the page.
      </p>
      <SectionImageField
        label="Image"
        value={props.decorativeImageUrl || props.imageUrl || ""}
        onChange={(url) => {
          setProp("imageUrl", url);
          setProp("decorativeImageUrl", "");
        }}
        fallbackUrl={brandingHero}
        fallbackLabel="Using the hero image from Branding."
      />
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
      <Field label="Width">
        <select className={INPUT} value={props.width ?? "full"} onChange={(e) => setProp("width", e.target.value)}>
          <option value="full">Full width</option>
          <option value="contained">Contained</option>
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
      <p className="text-xs text-[var(--muted)]">
        Edit the heading directly on the page.
      </p>
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
      <PresetStyleField presetsBySkin={PRODUCT_PRESETS} value={props.preset} onChange={(v) => setProp("preset", v)} />
      <Field label="Columns">
        <select className={INPUT} value={props.columns} onChange={(e) => setProp("columns", Number(e.target.value))}>
          <option value={1}>1 (single column, any style)</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </Field>
      {props.columns === 1 ? (
        <Field label="Position">
          <div className="flex gap-4">
            {(["left", "centre"] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="productAlign"
                  checked={(props.align ?? "left") === opt}
                  onChange={() => setProp("align", opt)}
                />
                {opt === "left" ? "Left" : "Centred"}
              </label>
            ))}
          </div>
        </Field>
      ) : null}
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
      <p className="text-xs text-[var(--muted)]">
        Edit the heading directly on the page.
      </p>
      <PresetStyleField
        presetsBySkin={CATEGORY_PRESETS}
        value={props.preset ?? props.layout}
        onChange={(v) => setProp("preset", v)}
      />
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
      <p className="text-xs text-[var(--muted)]">
        Edit the heading directly on the page.
      </p>
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
      <PresetStyleField presetsBySkin={NEXT_DROP_PRESETS} value={props.preset} onChange={(v) => setProp("preset", v)} />
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
      <p className="text-xs text-[var(--muted)]">
        Edit the heading and text directly on the page.
      </p>
      <Field label="Alignment">
        <select className={INPUT} value={props.alignment} onChange={(e) => setProp("alignment", e.target.value)}>
          <option value="left">Left</option>
          <option value="centre">Centre</option>
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
      <p className="text-xs text-[var(--muted)]">
        Edit the heading and text directly on the page.
      </p>
      <SectionImageField label="Image" value={props.imageUrl ?? ""} onChange={(url) => setProp("imageUrl", url)} />
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
      <p className="text-xs text-[var(--muted)]">
        Edit the heading and story directly on the page.
      </p>
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
