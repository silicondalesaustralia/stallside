"use client";

import {
  BUTTON_WIDTH_MAX,
  BUTTON_WIDTH_MIN,
  BUTTON_WIDTH_STANDARD,
  toggleProductButton,
  type ProductButtons,
} from "@/lib/studio/product-buttons";

/** Which buy buttons show (at least one) and how wide they are. */
export default function ProductButtonSettings({
  buttons,
  width,
  setProp,
}: {
  buttons: ProductButtons;
  width: number | null;
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
