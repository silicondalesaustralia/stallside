import type { LookProductPage, LookRichness, LookSection, LookStyle } from "@/lib/website-ai/assistant/brief/look";

export type LookOption<T extends string> = { value: T; label: string; explainer: string };

export const STYLE_OPTIONS: LookOption<LookStyle>[] = [
  { value: "auto", label: "Choose for me", explainer: "Vendl picks a style that suits your business and products." },
  { value: "modern", label: "Clean & modern", explainer: "Lots of white space, simple fonts and a calm, tidy layout." },
  { value: "rustic", label: "Warm & rustic", explainer: "Earthy colours and a homely, farm-stand feel." },
  { value: "bold", label: "Bold & shoppable", explainer: "Strong colours and big buttons that put products first." },
];

export const RICHNESS_OPTIONS: LookOption<LookRichness>[] = [
  { value: "auto", label: "Choose for me", explainer: "Vendl decides based on how much information you've given." },
  { value: "simple", label: "Simple", explainer: "A short homepage: your main photo, products and the essentials." },
  { value: "balanced", label: "Balanced", explainer: "A few extra sections, such as your story or how ordering works." },
  { value: "full", label: "Full", explainer: "Everything that applies, for a longer page with lots to explore." },
];

export const PRODUCT_PAGE_OPTIONS: LookOption<LookProductPage>[] = [
  { value: "auto", label: "Choose for me", explainer: "Vendl picks based on how many of your products have photos." },
  { value: "big", label: "Big photos", explainer: "A large product photo beside the details. Best with great photos." },
  { value: "classic", label: "Classic", explainer: "Photo and details side by side, like most online shops." },
  { value: "compact", label: "Compact", explainer: "Smaller photo and details up front. Good when photos are few." },
];

export const SECTION_OPTIONS: Record<LookSection, { label: string; explainer: string }> = {
  reviews: { label: "Reviews", explainer: "Shows what customers have said about you." },
  visit: { label: "Visit us", explainer: "Your address, opening hours and directions." },
  preorders: { label: "Pre-orders", explainer: "Your next order window, so customers can order ahead." },
  newsletter: { label: "Newsletter", explainer: "A sign-up box so customers hear about new stock." },
  faq: { label: "FAQ", explainer: "Answers to common questions about ordering and pickup." },
};
