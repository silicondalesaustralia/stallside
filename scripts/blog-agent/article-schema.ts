import { z } from "zod";
import {
  blogChangeNoteSchema,
  blogFaqSchema,
  blogResearchNotesSchema,
  blogTargetQuerySchema,
} from "../../src/lib/blog/types";

const imageBrief = z.object({
  prompt: z.string().trim().min(30).max(1500),
  alt: z.string().trim().min(10).max(200),
  filename: z.string().trim().min(3).max(80),
  caption: z.string().trim().max(200).nullish(),
});

export const articleSchema = z.object({
  title: z.string().trim().min(10).max(160),
  slug: z.string().trim().max(100).nullish(),
  section: z.enum(["NEWS", "GUIDE"]),
  seoTitle: z.string().trim().min(10).max(70),
  seoDescription: z.string().trim().min(50).max(170),
  excerpt: z.string().trim().min(20).max(400),
  bodyHtml: z.string().min(200),
  faqs: z.array(blogFaqSchema).max(12).default([]),
  keywords: z.string().max(400).nullish(),
  agentSummary: z.string().max(2000),
  researchNotes: blogResearchNotesSchema,
  targetQueries: z.array(blogTargetQuerySchema).max(30).nullish(),
  timeSensitive: z.boolean().default(false),
  /** Required for updates to a published post. */
  changeNotes: z.array(blogChangeNoteSchema).max(30).nullish(),
  images: z.object({
    hero: imageBrief.nullish(),
    inline: z.array(imageBrief.extend({ afterHeading: z.string().trim().min(1).max(200) })).max(3).default([]),
  }),
});

export type AgentArticle = z.infer<typeof articleSchema>;
export type InlineImageBrief = AgentArticle["images"]["inline"][number];

/** JSON shape described to the model (kept beside the schema so they stay in sync). */
export const ARTICLE_JSON_SHAPE = `{
  "title": string (on-page H1; a semantic variation, never the same wording as seoTitle), "slug": string, "section": "NEWS" | "GUIDE",
  "seoTitle": string (primary query first; <=60 ideal, 70 max), "seoDescription": string (140-160), "excerpt": string,
  "bodyHtml": string (no h1, no images), "faqs": [{ "question": string, "answer": string }],
  "keywords": string, "agentSummary": string (2-3 sentences: what and why),
  "researchNotes": { "whyThisTopic": string, "sources": [{ "title": string, "url": string }], "factChecks": [string], "internalLinks": [string] },
  "targetQueries": [{ "query": string, "impressions": number, "position": number }],
  "timeSensitive": boolean,
  "changeNotes": [{ "section": string, "reason": string }] (updates only),
  "images": {
    "hero": { "prompt": string, "alt": string, "filename": string, "caption": string } (new posts only),
    "inline": [{ "prompt": string, "alt": string, "filename": string, "caption": string, "afterHeading": string }]
  }
}`;
