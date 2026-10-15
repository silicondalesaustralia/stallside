import type { CSSProperties } from "react";
import { colourHex, type ThemePalette } from "@/lib/website/sections/colour";
import type { SiteStyle } from "./site-style";

const RADIUS = { square: "0.125rem", rounded: "0.5rem", pill: "9999px" } as const;
const CLASS = {
  outline: "studio-btn studio-btn--secondary text-sm",
  filled: "studio-btn studio-btn--primary text-sm",
  text: "inline-flex items-center px-2 text-sm font-semibold text-[var(--field)] hover:underline underline-offset-4",
} as const;

export type HeaderCartButton = {
  className: string;
  style: CSSProperties;
  label: string;
  showIcon: boolean;
  showCount: boolean;
  showWhenEmpty: boolean;
};

/** How the header cart button looks, from the site-wide style. */
export function headerCartButton(style: SiteStyle, palette: ThemePalette): HeaderCartButton {
  const variant = style.cartButtonStyle ?? "outline";
  const css: CSSProperties = {};
  if (style.cartButtonBackground && variant !== "text") css.background = colourHex(style.cartButtonBackground, palette);
  if (style.cartButtonColour) {
    css.color = colourHex(style.cartButtonColour, palette);
    if (variant === "outline") css.borderColor = css.color;
  }
  if (style.cartButtonShape && variant !== "text") css.borderRadius = RADIUS[style.cartButtonShape];
  return {
    className: CLASS[variant],
    style: css,
    label: style.cartButtonLabel ?? "Cart",
    showIcon: style.cartButtonIcon === true,
    showCount: style.cartButtonCount !== false,
    showWhenEmpty: style.cartButtonAlways === true,
  };
}
