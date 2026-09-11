import type { BlueprintBrandKit } from "./layout-types";
import type { WebsiteBlueprintId } from "./types";

function kit(
  partial: BlueprintBrandKit,
): BlueprintBrandKit {
  return partial;
}

export const BLUEPRINT_BRAND_KITS: Record<WebsiteBlueprintId, BlueprintBrandKit> = {
  editorial: kit({
    palette: {
      background: "#FAF8F4", surface: "#F0EBE3", text: "#1C1B19", muted: "#6B655D",
      primary: "#1C1B19", onPrimary: "#FAF8F4", accent: "#9A5B3C", onAccent: "#FAF8F4",
    },
    typography: {
      display: { family: "Cormorant Garamond", weights: [300, 500] },
      body: { family: "Work Sans", weights: [400, 500] },
      scaleRatio: 1.5, headingCase: "SENTENCE", headingTrackingEm: -0.01,
    },
    logoPlacement: {
      alignment: "CENTRE", plate: "NONE", maxHeightPx: 40, footerMaxHeightPx: 28,
      wordmark: { font: "DISPLAY", case: "UPPER", trackingEm: 0.2, longName: "SCALE" },
    },
    shape: { radiusPx: 0, buttonStyle: "SQUARE" },
  }),
  marketplace: kit({
    palette: {
      background: "#FFFFFF", surface: "#F1F4EC", text: "#1E2A1E", muted: "#56634F",
      primary: "#2F6B3A", onPrimary: "#FFFFFF", accent: "#F2B33D", onAccent: "#1E2A1E",
    },
    typography: {
      display: { family: "Bitter", weights: [600, 700] },
      body: { family: "Source Sans 3", weights: [400, 600] },
      scaleRatio: 1.25, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "NONE", maxHeightPx: 40, footerMaxHeightPx: 28,
      wordmark: { font: "DISPLAY", case: "AS_IS", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 12, buttonStyle: "ROUNDED" },
  }),
  heritage: kit({
    palette: {
      background: "#F4ECDF", surface: "#FBF6EE", text: "#3B2A1E", muted: "#6E5A48",
      primary: "#7A3E24", onPrimary: "#FBF6EE", accent: "#5E6B3A", onAccent: "#F4ECDF",
    },
    typography: {
      display: { family: "Young Serif", weights: [400] },
      body: { family: "Nunito Sans", weights: [400, 600] },
      scaleRatio: 1.333, headingCase: "TITLE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "CENTRE_ABOVE_NAV", plate: "NONE", maxHeightPx: 56, footerMaxHeightPx: 36,
      wordmark: { font: "DISPLAY", case: "UPPER", trackingEm: 0.18, longName: "SCALE" },
    },
    shape: { radiusPx: 4, buttonStyle: "DOUBLE_OUTLINE" },
  }),
  minimal: kit({
    palette: {
      background: "#FFFFFF", surface: "#F5F5F4", text: "#111111", muted: "#6B6B67",
      primary: "#111111", onPrimary: "#FFFFFF", accent: "#B8B8B2", onAccent: "#111111",
    },
    typography: {
      display: { family: "Jost", weights: [400, 500] },
      body: { family: "Inter", weights: [400] },
      scaleRatio: 1.2, headingCase: "UPPER", headingTrackingEm: 0.12,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "NONE", maxHeightPx: 28, footerMaxHeightPx: 22,
      wordmark: { font: "DISPLAY", case: "UPPER", trackingEm: 0.3, longName: "SCALE" },
    },
    shape: { radiusPx: 0, buttonStyle: "TEXT_LINK" },
  }),
  bold: kit({
    palette: {
      background: "#111111", surface: "#1F1F1F", text: "#FFFFFF", muted: "#B3B3B3",
      primary: "#FF5A1F", onPrimary: "#111111", accent: "#D7F75B", onAccent: "#111111",
    },
    typography: {
      display: { family: "Anton", weights: [400] },
      body: { family: "Space Grotesk", weights: [400, 500] },
      scaleRatio: 1.618, headingCase: "UPPER", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "STICKER", maxHeightPx: 36, footerMaxHeightPx: 28,
      wordmark: { font: "DISPLAY", case: "UPPER", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 0, buttonStyle: "OFFSET_SHADOW" },
  }),
  local: kit({
    palette: {
      background: "#FFFBF2", surface: "#FFF1CC", text: "#2A2A22", muted: "#5F5B4A",
      primary: "#B8412A", onPrimary: "#FFFFFF", accent: "#2F6D4F", onAccent: "#FFFBF2",
    },
    typography: {
      display: { family: "Bricolage Grotesque", weights: [600, 700] },
      body: { family: "Figtree", weights: [400, 500] },
      scaleRatio: 1.25, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "BADGE", maxHeightPx: 44, footerMaxHeightPx: 32,
      wordmark: { font: "DISPLAY", case: "AS_IS", trackingEm: 0, longName: "STACK" },
    },
    shape: { radiusPx: 16, buttonStyle: "PILL" },
  }),
  studio: kit({
    palette: {
      background: "#EFEDE8", surface: "#FFFFFF", text: "#22211F", muted: "#66625B",
      primary: "#22211F", onPrimary: "#EFEDE8", accent: "#3D5A80", onAccent: "#EFEDE8",
    },
    typography: {
      display: { family: "Instrument Serif", weights: [400], italic: true },
      body: { family: "Instrument Sans", weights: [400, 500] },
      scaleRatio: 1.414, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "NONE", maxHeightPx: 32, footerMaxHeightPx: 24,
      wordmark: { font: "DISPLAY", case: "LOWER", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 2, buttonStyle: "TEXT_LINK" },
  }),
  "modern-store": kit({
    palette: {
      background: "#FFFFFF", surface: "#F2F4F7", text: "#101828", muted: "#475467",
      primary: "#0F3D3E", onPrimary: "#FFFFFF", accent: "#F4A259", onAccent: "#101828",
    },
    typography: {
      display: { family: "Plus Jakarta Sans", weights: [700] },
      body: { family: "Plus Jakarta Sans", weights: [400, 500] },
      scaleRatio: 1.25, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "NONE", maxHeightPx: 36, footerMaxHeightPx: 28,
      wordmark: { font: "DISPLAY", case: "AS_IS", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 8, buttonStyle: "ROUNDED" },
  }),
  catalogue: kit({
    palette: {
      background: "#FFFFFF", surface: "#F6F7F8", text: "#1A1D21", muted: "#5B616B",
      primary: "#1A1D21", onPrimary: "#FFFFFF", accent: "#D6331F", onAccent: "#FFFFFF",
    },
    typography: {
      display: { family: "IBM Plex Sans Condensed", weights: [600] },
      body: { family: "IBM Plex Sans", weights: [400, 500] },
      scaleRatio: 1.125, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "NONE", maxHeightPx: 28, footerMaxHeightPx: 22,
      wordmark: { font: "DISPLAY", case: "AS_IS", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 4, buttonStyle: "ROUNDED" },
  }),
  boutique: kit({
    palette: {
      background: "#FCF7F5", surface: "#F3E3DE", text: "#3D2B2E", muted: "#735B5F",
      primary: "#8C4B5A", onPrimary: "#FFFFFF", accent: "#C6A27A", onAccent: "#3D2B2E",
    },
    typography: {
      display: { family: "Fraunces", weights: [400] },
      body: { family: "Karla", weights: [400, 500] },
      scaleRatio: 1.333, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "CENTRE", plate: "NONE", maxHeightPx: 44, footerMaxHeightPx: 32,
      wordmark: { font: "DISPLAY", case: "AS_IS", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 24, buttonStyle: "PILL" },
  }),
};
