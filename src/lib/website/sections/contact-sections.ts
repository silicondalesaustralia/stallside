import { z } from "zod";
import { ALL_PAGE_KINDS, body, heading, label } from "./fields";
import type { SectionDefinition } from "./types";
import { CONTACT_FORM_LAYOUTS } from "@/lib/studio/contact-form";

export const contactForm: SectionDefinition = {
  type: "contactForm",
  version: 1,
  craftName: "CraftContactFormSection",
  label: "Contact form",
  variantProp: "layout",
  variants: CONTACT_FORM_LAYOUTS,
  defaultVariant: "stacked",
  content: z.object({ heading: heading.optional(), body: body.optional(), buttonLabel: label.optional() }),
  settings: z.object({ showPhone: z.boolean().optional() }),
  pageKinds: ALL_PAGE_KINDS,
  singleton: false,
  required: false,
  emptyState: "render",
};
