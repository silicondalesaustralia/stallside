import { z } from "zod";
import { blogTargetQuerySchema } from "./types";

export const MAX_PICKS_PER_BATCH = 3;

export const recommendationSchema = z.object({
  title: z.string().trim().min(10).max(200),
  angle: z.string().trim().min(20).max(1000),
  /** Slug of a published post to revise; omit for a new post. */
  targetPostSlug: z.string().trim().max(100).nullish(),
  section: z.enum(["NEWS", "GUIDE"]),
  source: z.enum(["GSC", "KNOWLEDGE_BASE", "FEATURE", "MARKET", "NEWS", "MANUAL", "COMPETITOR", "COMMUNITY", "AI_ANSWERS"]),
  whyNow: z.string().trim().min(20).max(600),
  /** The Vendl feature that solves the reader's problem, and how the post leads to signing up. */
  vendlTieIn: z.string().trim().min(20).max(500),
  score: z.number().int().min(0).max(100),
  targetQueries: z.array(blogTargetQuerySchema).max(30).optional(),
  sourceUrls: z.array(z.string().url()).max(10).optional(),
  timeSensitive: z.boolean().optional(),
});

export const recommendationsBatchSchema = z.object({
  summary: z.string().trim().max(2000).optional(),
  recommendations: z.array(recommendationSchema).min(1).max(10),
});

export type BlogRecommendation = z.infer<typeof recommendationSchema>;
export type BlogRecommendationsBatch = z.infer<typeof recommendationsBatchSchema>;
