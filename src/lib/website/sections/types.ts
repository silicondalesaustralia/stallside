import type { z } from "zod";
import type { StudioSectionType } from "@/lib/studio/types";
import type { BusinessMode } from "@/lib/business-mode";
import type { PageKind } from "./fields";

export type VendlSectionType =
  | "hero"
  | "productGrid"
  | "categories"
  | "nextDrop"
  | "text"
  | "image"
  | "imageText"
  | "about"
  | "reviews"
  | "pickup"
  | "signup"
  | "farmStand"
  | "productDetail"
  | "menuDetail";

/** What a section does when its data source is empty on the public site. */
export type EmptyStatePolicy = "omit" | "render" | "blockPublish";

export type SectionDefinition = {
  type: VendlSectionType;
  version: number;
  /** Craft resolver name used by the current editor and renderer. */
  craftName: StudioSectionType;
  label: string;
  /** Craft prop that carries the visual variant, if any. */
  variantProp?: string;
  /** Fallback prop read when variantProp is absent (legacy payloads). */
  legacyVariantProp?: string;
  variants: readonly string[];
  defaultVariant: string;
  content: z.ZodObject;
  settings: z.ZodObject;
  binding?: z.ZodObject;
  pageKinds: readonly PageKind[];
  businessModes?: readonly BusinessMode[];
  singleton: boolean;
  /** Purchasing sections that must stay on their page kind. */
  required: boolean;
  emptyState: EmptyStatePolicy;
};
