import { z } from "zod";
import { BUSINESS_TYPE_IDS, type BusinessTypeId } from "./business-types";

export const DAY_IDS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayId = (typeof DAY_IDS)[number];
export const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"] as const;

const text = (max: number) => z.string().trim().min(1).max(max);
const url = z
  .string()
  .trim()
  .max(500)
  .url("Enter a full web address starting with https://")
  .refine((u) => u.startsWith("https://") || u.startsWith("http://"), "Links must start with https://");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time, e.g. 08:30");
const list = (max: number, itemMax = 80) => z.array(text(itemMax)).max(max);

const hoursSchema = z.object({ opens: time, closes: time });

/**
 * What the seller tells search engines about the business. Every field is optional;
 * missing values fall back to the website's own details (name, logo, email, phone, socials).
 */
export const businessProfileSchema = z.object({
  businessType: z.enum(BUSINESS_TYPE_IDS as [BusinessTypeId, ...BusinessTypeId[]]).optional(),
  legalName: text(120).optional(),
  alternateNames: list(5).optional(),
  slogan: text(160).optional(),
  description: text(600).optional(),
  foundingDate: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "Use YYYY, YYYY-MM or YYYY-MM-DD").optional(),
  taxId: text(40).optional(),
  address: z
    .object({
      street: text(160).optional(),
      locality: text(80).optional(),
      region: text(80).optional(),
      postcode: text(12).optional(),
      country: z.string().trim().length(2).optional(),
    })
    .optional(),
  /** Off by default so home-based sellers only publish suburb, state and postcode. */
  showStreetAddress: z.boolean().optional(),
  geo: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  areaServed: list(20).optional(),
  phone: text(30).optional(),
  email: z.string().trim().email().max(160).optional(),
  hours: z.partialRecord(z.enum(DAY_IDS), hoursSchema).optional(),
  googleBusinessProfileUrl: url.optional(),
  mapUrl: url.optional(),
  sameAs: z.array(url).max(20).optional(),
  knowsAbout: list(20).optional(),
  priceRange: z.enum(PRICE_RANGES).optional(),
  paymentAccepted: list(10, 40).optional(),
  founder: z
    .object({
      name: text(120),
      jobTitle: text(80).optional(),
      description: text(400).optional(),
      imageUrl: url.optional(),
      sameAs: z.array(url).max(10).optional(),
    })
    .optional(),
  awards: list(10, 160).optional(),
  certifications: list(10, 120).optional(),
  memberOf: list(10, 120).optional(),
  returnPolicy: z
    .object({
      accepted: z.boolean(),
      days: z.number().int().min(1).max(365).optional(),
      freeReturns: z.boolean().optional(),
    })
    .optional(),
});

export type BusinessProfile = z.infer<typeof businessProfileSchema>;

/** Reads a saved profile; invalid fields are dropped so one bad value can't remove all structured data. */
export function parseBusinessProfile(raw: unknown): BusinessProfile {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(businessProfileSchema.shape) as (keyof BusinessProfile)[]) {
    const parsed = businessProfileSchema.shape[key].safeParse(obj[key]);
    if (parsed.success && parsed.data !== undefined) out[key] = parsed.data;
  }
  return out as BusinessProfile;
}
