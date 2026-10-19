import { z } from "zod";
import { blogFaqSchema } from "./types";
import { sanitizeBlogHtml } from "./sanitize-blog-html";

const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().int().positive().max(6000).optional(),
);

const postFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  slug: z.string().trim().max(100).optional(),
  section: z.enum(["NEWS", "GUIDE"]),
  alsoListedIn: z.enum(["NEWS", "GUIDE", ""]).optional(),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(170),
  excerpt: z.string().trim().max(400),
  bodyHtml: z.string().max(200_000),
  keywords: z.string().trim().max(400).optional(),
  heroImageUrl: z.string().trim().max(500).optional(),
  heroImageAlt: z.string().trim().max(300).optional(),
  heroImageWidth: optionalInt,
  heroImageHeight: optionalInt,
  faqsJson: z.string().max(40_000).optional(),
});

function parseFaqJson(raw: string | undefined) {
  if (!raw) return [];
  try {
    const parsed = z.array(blogFaqSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function formString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

/** Admin editor form → BlogPost update fields. Throws with a readable message. */
export function parseBlogPostForm(formData: FormData) {
  const raw = Object.fromEntries(
    Object.keys(postFormSchema.shape).map((key) => [key, formString(formData, key)]),
  );
  const parsed = postFormSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  const d = parsed.data;
  const section = d.section;
  const alsoListedIn = d.alsoListedIn && d.alsoListedIn !== section ? d.alsoListedIn : null;

  return {
    slugInput: d.slug,
    data: {
      title: d.title,
      section,
      alsoListedIn,
      seoTitle: d.seoTitle || d.title.slice(0, 70),
      seoDescription: d.seoDescription,
      excerpt: d.excerpt,
      bodyHtml: sanitizeBlogHtml(d.bodyHtml),
      keywords: d.keywords || null,
      heroImageUrl: d.heroImageUrl || null,
      heroImageAlt: d.heroImageAlt || null,
      heroImageWidth: d.heroImageWidth ?? null,
      heroImageHeight: d.heroImageHeight ?? null,
      faqs: parseFaqJson(d.faqsJson),
    },
  };
}

/** Fields that must be filled before a post can go live. */
export function publishBlockers(data: {
  seoDescription: string;
  excerpt: string;
  bodyHtml: string;
}): string[] {
  const issues: string[] = [];
  if (data.seoDescription.length < 50) issues.push("SEO description needs at least 50 characters");
  if (data.excerpt.length < 20) issues.push("Excerpt needs at least 20 characters");
  if (data.bodyHtml.replace(/<[^>]+>/g, "").trim().length < 200) issues.push("Body is too short");
  return issues;
}
