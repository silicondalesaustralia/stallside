import { z } from "zod";
import { ALL_PAGE_KINDS, body, heading, label, mediaUrl, shortText } from "./fields";
import type { SectionDefinition } from "./types";
import {
  ABOUT_VARIANTS,
  DEFAULT_ONLY,
  HERO_VARIANTS,
  IMAGE_TEXT_VARIANTS,
  IMAGE_VARIANTS,
} from "./variants";

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
  }),
  settings: z.object({
    showCta: z.boolean().optional(),
    width: z.enum(["full", "contained"]).optional(),
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
  }),
  settings: z.object({}),
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
    heading: heading.optional(),
    body: body.optional(),
    ctaLabel: label.optional(),
  }),
  settings: z.object({}),
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
