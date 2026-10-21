import type { CSSProperties } from "react";
import { isColourValue } from "@/lib/website/sections/colour-value";
import { colourCss } from "@/lib/website/sections/colour";

export type OfferPageToggle = { key: string; label: string };
export type OfferPageWording = { key: string; label: string; fallback: string };

/** Parts of the pre-order page the seller can hide. */
export const PREORDER_TOGGLES: OfferPageToggle[] = [
  { key: "showImage", label: "Page photo" },
  { key: "showEyebrow", label: "Small label above the title" },
  { key: "showIntro", label: "Intro text" },
  { key: "showFacts", label: "Order by / collection facts" },
  { key: "showDetails", label: "About and collection details" },
];

/** Parts of the subscription and membership page the seller can hide. */
export const SUBSCRIPTION_TOGGLES: OfferPageToggle[] = [
  { key: "showImage", label: "Offer photo" },
  { key: "showEyebrow", label: "Small label above the title" },
  { key: "showIntro", label: "Intro text" },
  { key: "showFacts", label: "Facts row (term, collection…)" },
  { key: "showPrice", label: "Headline price" },
  { key: "showHowItWorks", label: "How it works steps" },
  { key: "showTerms", label: "Terms and details" },
];

/** Parts of the pre-order and subscription list pages the seller can hide. */
export const LIST_TOGGLES: OfferPageToggle[] = [
  { key: "showEyebrow", label: "Small label above the heading" },
  { key: "showHeading", label: "Heading" },
  { key: "showIntro", label: "Intro text" },
  { key: "showImages", label: "Card photos" },
  { key: "showDescriptions", label: "Card descriptions" },
  { key: "showFooter", label: "Note under the cards (memberships)" },
];

/** Button wording that can't be clicked to edit on the page. */
export const PREORDER_WORDING: OfferPageWording[] = [
  { key: "checkoutButton", label: "Checkout button", fallback: "Add & checkout" },
  { key: "cartButton", label: "Add to cart button", fallback: "Add to cart" },
];

export const SUBSCRIPTION_WORDING: OfferPageWording[] = [
  { key: "payButton", label: "Payment button", fallback: "Continue to payment" },
];

/** List pages: only the empty-state button can't be clicked to edit. */
export const LIST_WORDING: OfferPageWording[] = [
  { key: "interestButton", label: "“Tell the store owner” button", fallback: "Tell the store owner" },
];

export type OfferPageView = {
  /** Toggle key → shown; missing keys are shown. */
  show: Record<string, boolean>;
  panelBackground: string | null;
  cardBackground: string | null;
};

export const DEFAULT_OFFER_VIEW: OfferPageView = { show: {}, panelBackground: null, cardBackground: null };

export function offerPageView(props: Record<string, unknown>, toggles: OfferPageToggle[]): OfferPageView {
  const show: Record<string, boolean> = {};
  for (const t of toggles) show[t.key] = props[t.key] !== false;
  return {
    show,
    panelBackground: isColourValue(props.panelBackground) ? props.panelBackground : null,
    cardBackground: isColourValue(props.cardBackground) ? props.cardBackground : null,
  };
}

export function isShown(view: OfferPageView | undefined, key: string): boolean {
  return view?.show[key] !== false;
}

/** Wrapper style for the middle column: its own background, plus the card colour for the cards inside it. */
export function offerPanelStyle(view: OfferPageView | undefined): CSSProperties | undefined {
  if (!view?.panelBackground && !view?.cardBackground) return undefined;
  const vars: Record<string, string> = {};
  if (view.panelBackground) {
    const bg = colourCss(view.panelBackground);
    Object.assign(vars, { "--offer-panel-bg": bg, background: bg, padding: "1.5rem", borderRadius: "1rem" });
  }
  if (view.cardBackground) vars["--offer-card-bg"] = colourCss(view.cardBackground);
  return vars as CSSProperties;
}
