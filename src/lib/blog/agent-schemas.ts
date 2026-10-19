import { z } from "zod";
import { BLOG_HTML_MAX_LENGTH } from "./sanitize-blog-html";
import {
  blogChangeNoteSchema,
  blogFaqSchema,
  blogResearchNotesSchema,
  blogTargetQuerySchema,
} from "./types";

const section = z.enum(["NEWS", "GUIDE"]);
const source = z.enum(["GSC", "KNOWLEDGE_BASE", "FEATURE", "MARKET", "NEWS", "MANUAL", "COMPETITOR", "COMMUNITY", "AI_ANSWERS"]);
const bodyHtml = z.string().min(200).max(BLOG_HTML_MAX_LENGTH);

const heroImage = z.object({
  url: z.string().refine((v) => v.startsWith("https://") || v.startsWith("/"), "https or site path"),
  alt: z.string().max(300),
  width: z.number().int().positive().max(6000),
  height: z.number().int().positive().max(6000),
});

export const createDraftSchema = z.object({
  slug: z.string().max(100).optional(),
  section,
  alsoListedIn: section.nullish(),
  title: z.string().trim().min(10).max(160),
  seoTitle: z.string().trim().min(10).max(70),
  seoDescription: z.string().trim().min(50).max(170),
  excerpt: z.string().trim().min(20).max(400),
  bodyHtml,
  faqs: z.array(blogFaqSchema).max(12).optional(),
  keywords: z.string().max(400).optional(),
  heroImage: heroImage.optional(),
  source,
  targetQueries: z.array(blogTargetQuerySchema).max(30).optional(),
  researchNotes: blogResearchNotesSchema.optional(),
  agentSummary: z.string().max(2000).optional(),
  timeSensitive: z.boolean().optional(),
  topicId: z.string().max(40).optional(),
});

export const createRevisionSchema = z.object({
  postId: z.string().min(1).max(40),
  proposedBodyHtml: bodyHtml,
  proposedTitle: z.string().trim().min(10).max(160).optional(),
  proposedSeoTitle: z.string().trim().min(10).max(70).optional(),
  proposedSeoDescription: z.string().trim().min(50).max(170).optional(),
  proposedExcerpt: z.string().trim().min(20).max(400).optional(),
  proposedFaqs: z.array(blogFaqSchema).max(12).optional(),
  changeNotes: z.array(blogChangeNoteSchema).min(1).max(30),
  targetQueries: z.array(blogTargetQuerySchema).max(30).optional(),
  agentSummary: z.string().max(2000).optional(),
  topicId: z.string().max(40).optional(),
});

const topicInput = z.object({
  title: z.string().trim().min(5).max(200),
  angle: z.string().max(1000).optional(),
  source,
  status: z.enum(["IDEA", "WAITING_FOR_RELEASE"]).optional(),
  section: section.optional(),
  score: z.number().int().min(0).max(100).optional(),
  targetQueries: z.array(blogTargetQuerySchema).max(30).optional(),
  sourceUrls: z.array(z.string().url()).max(20).optional(),
  featureRef: z.string().max(300).optional(),
  notes: z.string().max(2000).optional(),
  expiresAt: z.iso.datetime({ offset: true }).optional(),
});

const topicUpdate = z.object({
  id: z.string().min(1).max(40),
  status: z.enum(["IDEA", "WAITING_FOR_RELEASE", "USED", "REJECTED", "EXPIRED"]).optional(),
  score: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
  /** Writer failure message; clears the pick so the topic can be picked again. */
  writeError: z.string().max(1000).optional(),
});

export const topicsBatchSchema = z.object({
  create: z.array(topicInput).max(50).optional(),
  update: z.array(topicUpdate).max(100).optional(),
});

export const digestSchema = z.object({
  subject: z.string().trim().min(5).max(200),
  summaryHtml: z.string().min(10).max(50_000),
});

export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type CreateRevisionInput = z.infer<typeof createRevisionSchema>;
export type TopicsBatchInput = z.infer<typeof topicsBatchSchema>;
