"use client";

import {
  BUTTON_WIDTH_MAX,
  BUTTON_WIDTH_MIN,
  BUTTON_WIDTH_STANDARD,
  toggleProductButton,
  type ProductButtons,
} from "@/lib/studio/product-buttons";
import { SECTION_TEXT_MAX, withSectionText } from "@/lib/studio/section-texts";

const LABELS = [
  { key: "addToCart", fallback: "Add to cart", which: "cart" },
  { key: "addAndCheckout", fallback: "Add & checkout", which: "checkout" },
] as const;

/** Which buy buttons show (at least one), their wording and how wide they are. */
export default function ProductButtonSettings({
  buttons,
  width,
  texts,
  setProp,
}: {
  buttons: ProductButtons;
  width: number | null;
  texts?: Record<string, string>;
  setProp: (k: string, v: unknown) => void;
}) {
  const cart = buttons !== "checkout";
  const checkout = buttons !== "cart";
  const box = (label: string, which: "cart" | "checkout", on: boolean, otherOn: boolean) => (
    <label className={`flex items-center gap-2 text-sm ${on && !otherOn ? "opacity-60" : ""}`}>
      <input
        type="checkbox"
        checked={on}
        disabled={on && !otherOn}
        title={on && !otherOn ? "One button must stay on" : undefined}
        onChange={(e) => setProp("buttons", toggleProductButton(buttons, which, e.target.checked))}
      />
      {label}
    </label>
  );

  return (
    <div className="space-y-2">
      <p className="block text-xs font-semibold text-[var(--field)]">Buy buttons</p>
      {box("Show Add to cart", "cart", cart, checkout)}
      {box("Show Add & checkout", "checkout", checkout, cart)}
      <p className="text-xs text-[var(--muted)]">At least one button always shows.</p>
      {LABELS.filter((l) => (l.which === "cart" ? cart : checkout)).map((l) => (
        <div key={l.key} className="space-y-1">
          <label htmlFor={`product-label-${l.key}`} className="block text-xs font-semibold text-[var(--field)]">
            {l.fallback} button text
          </label>
          <input
            id={`product-label-${l.key}`}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            value={texts?.[l.key] ?? ""}
            placeholder={l.fallback}
            maxLength={SECTION_TEXT_MAX}
            onChange={(e) => setProp("texts", withSectionText(texts, l.key, e.target.value, l.fallback))}
          />
        </div>
      ))}
      <p className="text-xs text-[var(--muted)]">Leave blank for the default. You can also click a button on the page to rename it.</p>
      <div className="space-y-1.5 pt-1">
        <label htmlFor="product-button-width" className="flex justify-between text-xs font-semibold text-[var(--field)]">
          Button width
          <span className="font-normal text-[var(--muted)]">{width == null ? "Standard" : `${width}% of the column`}</span>
        </label>
        <input
          id="product-button-width"
          type="range"
          min={BUTTON_WIDTH_MIN}
          max={BUTTON_WIDTH_MAX}
          step={1}
          value={width ?? BUTTON_WIDTH_STANDARD}
          onChange={(e) => setProp("buttonWidth", Number(e.target.value))}
          className="w-full accent-[var(--leaf)]"
        />
        {width != null ? (
          <button type="button" className="text-xs font-semibold text-[var(--leaf-dark)] underline" onClick={() => setProp("buttonWidth", undefined)}>
            Reset to standard width
          </button>
        ) : null}
      </div>
    </div>
  );
}
