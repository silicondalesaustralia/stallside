import { z } from "zod";
import { WEBSITE_LIMITS as L } from "@/lib/website/schema/limits";

export const heading = z.string().max(L.headingChars);
export const shortText = z.string().max(L.shortTextChars);
export const body = z.string().max(L.bodyChars);
export const label = z.string().max(L.labelChars);

/** Absolute http(s) URL or a site-relative path; empty string means "none". */
export const mediaUrl = z
  .string()
  .max(L.urlChars)
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
    "Images must be uploaded or use an https:// address.",
  );

export const entityId = z.string().min(1).max(L.idChars);

export const count = (min: number, max: number) => z.number().int().min(min).max(max);

export type PageKind = "home" | "content" | "shop" | "category" | "product" | "menu";
export const ALL_PAGE_KINDS: PageKind[] = [
  "home",
  "content",
  "shop",
  "category",
  "product",
  "menu",
];
