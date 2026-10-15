"use client";

import { useState } from "react";
import { paletteOf } from "@/lib/website/sections/colour";
import { BUTTON_SHAPES, CART_BUTTON_STYLES } from "@/lib/storefront/site-style";
import { useStudioEditorChrome, useStudioMetadata } from "./StudioEditorContext";
import ColourField from "./ColourField";
import SiteChoice from "./SiteChoice";
import SiteStyleSelect from "./SiteStyleSelect";

const STYLES = { outline: "Outline", filled: "Filled", text: "Text only" } as const;
const SHAPES = { square: "Square", rounded: "Rounded", pill: "Pill" } as const;
const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/** The cart button in the header: style, wording, icon, colours and shape. Saved with the site-wide style. */
export default function CartButtonSettings({ divided = true }: { divided?: boolean }) {
  const { siteStyle = {}, setSiteStyleField } = useStudioEditorChrome();
  const palette = paletteOf(useStudioMetadata().resolvedBranding);
  const set = setSiteStyleField ?? (() => undefined);
  const [label, setLabel] = useState(siteStyle.cartButtonLabel ?? "");
  const style = siteStyle.cartButtonStyle ?? "outline";

  return (
    <div className={divided ? "mt-6 space-y-3 border-t border-[var(--line)] pt-4" : "space-y-3"}>
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Header cart button</p>
      <SiteChoice label="Style" options={CART_BUTTON_STYLES} labels={STYLES} value={style} onChange={(v) => set("cartButtonStyle", v === "outline" ? undefined : v)} />
      <div className="space-y-1.5">
        <label htmlFor="cart-btn-label" className="block text-xs font-semibold text-[var(--field)]">Button text</label>
        <input
          id="cart-btn-label"
          className={INPUT}
          value={label}
          maxLength={20}
          placeholder="Cart"
          onChange={(e) => {
            setLabel(e.target.value);
            set("cartButtonLabel", e.target.value.trim() || undefined);
          }}
        />
      </div>
      <Check label="Show a bag icon" checked={siteStyle.cartButtonIcon === true} onChange={(v) => set("cartButtonIcon", v || undefined)} />
      <Check label="Show the number of items" checked={siteStyle.cartButtonCount !== false} onChange={(v) => set("cartButtonCount", v ? undefined : false)} />
      <Check label="Show while the cart is empty" checked={siteStyle.cartButtonAlways === true} onChange={(v) => set("cartButtonAlways", v || undefined)} />
      {style !== "text" ? (
        <ColourField label="Button colour" value={siteStyle.cartButtonBackground} onChange={(v) => set("cartButtonBackground", v)} palette={palette} noneLabel="Template default" />
      ) : null}
      <ColourField label="Text colour" value={siteStyle.cartButtonColour} onChange={(v) => set("cartButtonColour", v)} palette={palette} noneLabel="Template default" />
      {style !== "text" ? (
        <SiteStyleSelect id="cart-btn-shape" label="Shape" options={BUTTON_SHAPES} labels={SHAPES} value={siteStyle.cartButtonShape} onChange={(v) => set("cartButtonShape", v)} defaultLabel="Same as other buttons" />
      ) : null}
      <p className="text-xs text-[var(--muted)]">The editor always shows the button so you can style it.</p>
    </div>
  );
}
