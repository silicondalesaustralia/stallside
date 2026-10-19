import { z } from "zod";

export const aiCitationSchema = z.object({
  url: z.string().min(1).max(2000),
  title: z.string().max(500).nullish(),
  domain: z.string().max(200),
});

export const aiVisibilityResultSchema = z.object({
  engine: z.string().min(1).max(40),
  question: z.string().min(1).max(500),
  answerExcerpt: z.string().max(4000),
  vendlMentioned: z.boolean(),
  vendlCited: z.boolean(),
  competitorsMentioned: z.array(z.string().max(80)).max(20),
  citations: z.array(aiCitationSchema).max(40),
});

export const aiVisibilityBatchSchema = z.object({
  runAt: z.string().datetime(),
  results: z.array(aiVisibilityResultSchema).min(1).max(100),
});

export type AiCitation = z.infer<typeof aiCitationSchema>;
export type AiVisibilityResult = z.infer<typeof aiVisibilityResultSchema>;
export type AiVisibilityBatch = z.infer<typeof aiVisibilityBatchSchema>;
