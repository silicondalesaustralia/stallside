import { z } from "zod";
import { ALL_PAGE_KINDS, body, heading, label, mediaUrl, shortText } from "./fields";
import type { SectionDefinition } from "./types";
import { SPACER_MAX, SPACER_MIN } from "@/lib/studio/spacer-settings";
import { IMAGE_ASPECTS, IMAGE_DISPLAYS, galleryImagesSchema } from "@/lib/studio/gallery-images";
import { faqItemsSchema } from "@/lib/studio/faq-items";
import {
  ABOUT_VARIANTS,
  DEFAULT_ONLY,
  HERO_VARIANTS,
  IMAGE_TEXT_VARIANTS,
  IMAGE_VARIANTS,
} from "./variants";
import { HERO_ALIGNS, HERO_HEIGHTS, HERO_IMAGE_SIDES, HERO_OVERLAYS } from "@/lib/studio/hero-look";
import { isButtonLink } from "@/lib/studio/button-link";
import { IMAGE_STYLES } from "@/lib/studio/image-pair";

const CONTENT_PAGES = ALL_PAGE_KINDS;

export const hero: SectionDefinition = {
  type: "hero",
  version: 1,
  craftName: "CraftHeroSection",
  label: "Hero",
  variantProp: "layout",
  variants: HERO_VARIANTS,
  defaultVariant: "background",
  content: z.object({
    headline: heading.optional(),
    supportingText: shortText.optional(),
    ctaLabel: label.optional(),
    imageUrl: mediaUrl.optional(),
    decorativeImageUrl: mediaUrl.optional(),
    secondImageUrl: mediaUrl.optional(),
    secondaryLabel: label.optional(),
  }),
  settings: z.object({
    imageStyle: z.enum(IMAGE_STYLES).optional(),
    showCta: z.boolean().optional(),
    width: z.enum(["full", "contained"]).optional(),
    height: z.enum(HERO_HEIGHTS).optional(),
    align: z.enum(HERO_ALIGNS).optional(),
    overlay: z.enum(HERO_OVERLAYS).optional(),
    imageSide: z.enum(HERO_IMAGE_SIDES).optional(),
    mobileTextBelow: z.boolean().optional(),
    secondaryLink: z.string().refine(isButtonLink, "Choose a page or enter a web address").optional(),
  }),
  pageKinds: ["home", "content"],
  singleton: true,
  required: false,
  emptyState: "render",
};

export const text: SectionDefinition = {
  type: "text",
  version: 1,
  craftName: "CraftTextSection",
  label: "Text",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({ heading: heading.optional(), body: body.optional() }),
  settings: z.object({ alignment: z.enum(["left", "centre"]).optional() }),
  pageKinds: CONTENT_PAGES,
  singleton: false,
  required: false,
  emptyState: "omit",
};

export const faq: SectionDefinition = {
  type: "faq",
  version: 1,
  craftName: "CraftFaqSection",
  label: "FAQ",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({ heading: heading.optional(), intro: shortText.optional(), items: faqItemsSchema.optional() }),
  settings: z.object({ startOpen: z.boolean().optional() }),
  pageKinds: CONTENT_PAGES,
  singleton: false,
  required: false,
  emptyState: "omit",
};

export const image: SectionDefinition = {
  type: "image",
  version: 1,
  craftName: "CraftImageSection",
  label: "Image",
  variantProp: "layout",
  variants: IMAGE_VARIANTS,
  defaultVariant: "contained",
  content: z.object({
    imageUrl: mediaUrl.nullable().optional(),
    alt: shortText.optional(),
    caption: shortText.optional(),
    images: galleryImagesSchema.optional(),
    secondImageUrl: mediaUrl.nullable().optional(),
  }),
  settings: z.object({
    imageStyle: z.enum(IMAGE_STYLES).optional(),
    display: z.enum(IMAGE_DISPLAYS).optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    aspect: z.enum(IMAGE_ASPECTS).optional(),
    autoplay: z.boolean().optional(),
  }),
  pageKinds: CONTENT_PAGES,
  singleton: false,
  required: false,
  emptyState: "omit",
};

export const imageText: SectionDefinition = {
  type: "imageText",
  version: 1,
  craftName: "CraftImageTextSection",
  label: "Image + text",
  variantProp: "layout",
  variants: IMAGE_TEXT_VARIANTS,
  defaultVariant: "image-left",
  content: z.object({
    imageUrl: mediaUrl.nullable().optional(),
    secondImageUrl: mediaUrl.nullable().optional(),
    heading: heading.optional(),
    body: body.optional(),
    ctaLabel: label.optional(),
  }),
  settings: z.object({ imageStyle: z.enum(IMAGE_STYLES).optional() }),
  pageKinds: CONTENT_PAGES,
  singleton: false,
  required: false,
  emptyState: "render",
};

export const about: SectionDefinition = {
  type: "about",
  version: 1,
  craftName: "CraftAboutSection",
  label: "About",
  variantProp: "layout",
  variants: ABOUT_VARIANTS,
  defaultVariant: "simple",
  content: z.object({ heading: heading.optional(), body: body.optional() }),
  settings: z.object({}),
  pageKinds: CONTENT_PAGES,
  singleton: true,
  required: false,
  emptyState: "omit",
};

export const spacer: SectionDefinition = {
  type: "spacer",
  version: 1,
  craftName: "CraftSpacerSection",
  label: "Spacer",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({}),
  settings: z.object({
    height: z.number().int().min(SPACER_MIN).max(SPACER_MAX).optional(),
    mobileHeight: z.number().int().min(SPACER_MIN).max(SPACER_MAX).optional(),
    hideLines: z.boolean().optional(),
  }),
  pageKinds: ALL_PAGE_KINDS,
  singleton: false,
  required: false,
  emptyState: "render",
};
