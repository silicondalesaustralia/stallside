import { z } from "zod";

export const blogFaqSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(2000),
});

export const blogChangeNoteSchema = z.object({
  section: z.string().trim().min(1).max(200),
  reason: z.string().trim().min(1).max(1000),
});

export const blogTargetQuerySchema = z.object({
  query: z.string().trim().min(1).max(200),
  impressions: z.number().int().nonnegative().optional(),
  clicks: z.number().int().nonnegative().optional(),
  position: z.number().nonnegative().optional(),
  page: z.string().max(500).optional(),
  /** Monthly Google Australia searches (DataForSEO). */
  volume: z.number().int().nonnegative().nullish(),
  difficulty: z.number().int().min(0).max(100).nullish(),
  intent: z.string().max(40).nullish(),
});

export const blogResearchNotesSchema = z.object({
  whyThisTopic: z.string().max(3000).optional(),
  sources: z
    .array(z.object({ title: z.string().max(300), url: z.string().url() }))
    .max(40)
    .optional(),
  factChecks: z.array(z.string().max(500)).max(40).optional(),
  internalLinks: z.array(z.string().max(300)).max(40).optional(),
});

export type BlogFaq = z.infer<typeof blogFaqSchema>;
export type BlogChangeNote = z.infer<typeof blogChangeNoteSchema>;
export type BlogTargetQuery = z.infer<typeof blogTargetQuerySchema>;
export type BlogResearchNotes = z.infer<typeof blogResearchNotesSchema>;

export function parseFaqs(value: unknown): BlogFaq[] {
  const parsed = z.array(blogFaqSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function parseChangeNotes(value: unknown): BlogChangeNote[] {
  const parsed = z.array(blogChangeNoteSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function parseTargetQueries(value: unknown): BlogTargetQuery[] {
  const parsed = z.array(blogTargetQuerySchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function parseResearchNotes(value: unknown): BlogResearchNotes {
  const parsed = blogResearchNotesSchema.safeParse(value);
  return parsed.success ? parsed.data : {};
}
