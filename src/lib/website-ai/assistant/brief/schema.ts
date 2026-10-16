import { z } from "zod";
import { defaultLook, lookSchema } from "./look";

export const BRIEF_SCHEMA_VERSION = 1 as const;

export const PRIMARY_GOALS = [
  "sell_online",
  "local_visits",
  "pre_orders",
  "subscriptions",
  "enquiries",
  "information",
] as const;
export type PrimaryGoal = (typeof PRIMARY_GOALS)[number];

export const PHOTO_PURPOSES = ["logo", "product", "team", "hero", "general"] as const;
export type PhotoPurpose = (typeof PHOTO_PURPOSES)[number];

export const POLICY_PAGE_IDS = ["PRIVACY", "TERMS", "REFUNDS", "SHIPPING"] as const;
export type PolicyPageId = (typeof POLICY_PAGE_IDS)[number];

const text = (max: number) => z.string().trim().max(max);
const url = z.string().trim().max(2048);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colours must be a 6-digit hex code like #2f5d3a.");

const followUpSchema = z.object({
  id: text(40),
  question: text(300),
  answer: text(1000),
});

const importedFactSchema = z.object({
  field: z.enum(["description", "offering", "story", "serviceArea", "audience", "differentiators"]),
  value: text(1000),
  accepted: z.boolean(),
});

const importSourceSchema = z.object({
  url,
  status: z.enum(["ok", "unreadable", "blocked"]),
  title: text(200).optional(),
  facts: z.array(importedFactSchema).max(12),
  photoUrls: z.array(url).max(12),
  importedAt: z.string().max(40),
});

const photoSchema = z.object({ url, purpose: z.enum(PHOTO_PURPOSES), alt: text(160).optional() });

const customPageSchema = z.object({ id: text(40), title: text(60), purpose: text(300) });

export const briefDataSchema = z.object({
  business: z.object({
    name: text(120),
    description: text(600),
    offering: text(600),
    primaryGoal: z.enum(PRIMARY_GOALS).nullable(),
    secondaryGoals: z.array(z.enum(PRIMARY_GOALS)).max(5),
    audience: text(300),
    story: text(2000),
    differentiators: text(600),
    serviceArea: text(200),
    showAddress: z.boolean(),
    showPhone: z.boolean(),
    instructions: text(1000),
  }),
  sources: z.object({
    urls: z.array(url).max(3),
    imports: z.array(importSourceSchema).max(3),
    pastedText: text(4000),
  }),
  followUps: z.array(followUpSchema).max(6),
  branding: z.object({
    useExisting: z.boolean(),
    logoUrl: url.nullable(),
    accentColor: hex.nullable(),
    secondaryColor: hex.nullable(),
    heroImageUrl: url.nullable(),
    photos: z.array(photoSchema).max(20),
    decorativeImages: z.boolean(),
  }),
  /** Look & features answers; briefs saved before this step get "choose for me". */
  look: lookSchema.default(defaultLook),
  pages: z.object({
    selected: z.array(text(40)).max(16),
    custom: z.array(customPageSchema).max(3),
    policies: z.array(z.enum(POLICY_PAGE_IDS)).max(4),
  }),
  /** Unsupported requests the seller made, with why. Never silently dropped. */
  unsupported: z.array(z.object({ request: text(200), reason: text(300) })).max(10),
  step: z.number().int().min(1).max(5),
  prefilledAt: z.string().max(40).nullable(),
});

export type BriefData = z.infer<typeof briefDataSchema>;
export type BriefPhoto = z.infer<typeof photoSchema>;
export type BriefImportSource = z.infer<typeof importSourceSchema>;
export type BriefCustomPage = z.infer<typeof customPageSchema>;

export function emptyBrief(): BriefData {
  return {
    business: {
      name: "",
      description: "",
      offering: "",
      primaryGoal: null,
      secondaryGoals: [],
      audience: "",
      story: "",
      differentiators: "",
      serviceArea: "",
      showAddress: false,
      showPhone: false,
      instructions: "",
    },
    sources: { urls: [], imports: [], pastedText: "" },
    followUps: [],
    branding: {
      useExisting: true,
      logoUrl: null,
      accentColor: null,
      secondaryColor: null,
      heroImageUrl: null,
      photos: [],
      decorativeImages: false,
    },
    look: defaultLook(),
    pages: { selected: ["HOME"], custom: [], policies: [] },
    unsupported: [],
    step: 1,
    prefilledAt: null,
  };
}

/** Parses stored brief JSON, falling back to an empty brief for unknown shapes. */
export function parseBriefData(raw: unknown): BriefData {
  const parsed = briefDataSchema.safeParse(raw);
  return parsed.success ? parsed.data : emptyBrief();
}
