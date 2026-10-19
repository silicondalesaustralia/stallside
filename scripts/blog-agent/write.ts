/**
 * Writer: research and draft one picked topic (new post or update) with images.
 *
 *   npx tsx scripts/blog-agent/write.ts --topic <topicId>
 *
 * Env: BLOG_AGENT_BASE_URL, BLOG_AGENT_TOKEN, OPENAI_API_KEY.
 */
import "dotenv/config";
import { appGet, appPost, reportFailure } from "./api";
import { ARTICLE_JSON_SHAPE, articleSchema, type AgentArticle } from "./article-schema";
import { insertFigures, type PlacedImage } from "./figures";
import { tryCreatePostImage, uniqueFilenames } from "./images";
import { askJson } from "./openai";
import { agentDoc, knowledgeBaseSource, todayInAdelaide, vendlFactsSource } from "./repo-context";
import { buildSerpBrief } from "./serp-brief";

type Topic = { id: string; title: string; angle: string | null; notes: string | null; featureRef: string | null; source: string; section: string | null; targetQueries: unknown; sourceUrls: unknown; targetPostSlug: string | null; expiresAt: string | null };
type TargetPost = { id: string; slug: string; section: string; title: string; seoTitle: string; seoDescription: string; excerpt: string; bodyHtml: string; faqs: unknown };

function topicIdArg(): string {
  const index = process.argv.indexOf("--topic");
  const id = index >= 0 ? process.argv[index + 1]?.trim() : "";
  if (!id) throw new Error("Pass --topic <topicId>");
  return id;
}

function folderFor(article: AgentArticle, targetPost: TargetPost | null): string {
  const raw = targetPost?.slug ?? article.slug ?? article.title;
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "post";
}

async function draftArticle(topic: Topic, targetPost: TargetPost | null): Promise<AgentArticle> {
  const [context, serpBrief] = await Promise.all([appGet<unknown>("/context"), buildSerpBrief(topic, targetPost)]);
  const task = targetPost
    ? "Propose an update to the published post in targetPost. Return the complete revised bodyHtml and changeNotes."
    : "Write a complete new post for this topic.";
  const raw = await askJson({
    instructions: [
      "You are the writer for Vendl's blog. Follow the playbook and writing standard exactly.",
      agentDoc("PLAYBOOK"),
      agentDoc("WRITING"),
      `Return only a json object with this shape:\n${ARTICLE_JSON_SHAPE}`,
    ].join("\n\n"),
    input: `${task} Research with web search before writing. Today is ${todayInAdelaide()}.\n${JSON.stringify({
      topic,
      targetPost,
      serpBrief,
      blogContext: context,
      vendlFactFiles: vendlFactsSource(),
      knowledgeBase: knowledgeBaseSource(),
    })}`,
    webSearch: true,
  });
  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Writer output failed validation: ${JSON.stringify(parsed.error.issues).slice(0, 1500)}`);
  }
  return parsed.data;
}

async function inlineImages(article: AgentArticle, folder: string, limit: number): Promise<PlacedImage[]> {
  const briefs = uniqueFilenames(article.images.inline.slice(0, limit));
  const results = await Promise.all(
    briefs.map(async (brief): Promise<PlacedImage | null> => {
      const uploaded = await tryCreatePostImage({ folder, filename: brief.filename, prompt: brief.prompt, shape: "landscape" });
      return uploaded ? { ...uploaded, alt: brief.alt, caption: brief.caption, afterHeading: brief.afterHeading } : null;
    }),
  );
  return results.filter((image): image is PlacedImage => image !== null);
}

async function main() {
  const topicId = topicIdArg();
  try {
    const { topic, targetPost } = await appGet<{ topic: Topic; targetPost: TargetPost | null }>(`/topics/${topicId}`);
    if (topic.targetPostSlug && !targetPost) throw new Error(`Post /${topic.targetPostSlug} is no longer published`);
    const article = await draftArticle(topic, targetPost);
    const folder = folderFor(article, targetPost);

    if (targetPost) {
      if (!article.changeNotes?.length) throw new Error("Update returned no changeNotes");
      const images = await inlineImages(article, folder, 2);
      const revision = await appPost<{ id: string }>("/revisions", {
        postId: targetPost.id,
        proposedBodyHtml: insertFigures(article.bodyHtml, images),
        proposedTitle: article.title,
        proposedSeoTitle: article.seoTitle,
        proposedSeoDescription: article.seoDescription,
        proposedExcerpt: article.excerpt,
        proposedFaqs: article.faqs,
        changeNotes: article.changeNotes,
        targetQueries: article.targetQueries ?? undefined,
        agentSummary: article.agentSummary,
        topicId,
      });
      console.log(`Revision ${revision.id} proposed for /${targetPost.slug} with ${images.length} images`);
      return;
    }

    const heroBrief = article.images.hero;
    const [hero, images] = await Promise.all([
      heroBrief
        ? tryCreatePostImage({ folder, filename: uniqueFilenames([heroBrief])[0].filename, prompt: heroBrief.prompt, shape: "landscape" })
        : Promise.resolve(null),
      inlineImages(article, folder, 3),
    ]);
    const draft = await appPost<{ id: string; slug: string }>("/drafts", {
      slug: article.slug ?? undefined,
      section: article.section,
      title: article.title,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      excerpt: article.excerpt,
      bodyHtml: insertFigures(article.bodyHtml, images),
      faqs: article.faqs,
      keywords: article.keywords ?? undefined,
      heroImage: hero && heroBrief ? { url: hero.url, alt: heroBrief.alt, width: hero.width, height: hero.height } : undefined,
      source: topic.source,
      targetQueries: article.targetQueries ?? undefined,
      researchNotes: article.researchNotes,
      agentSummary: article.agentSummary,
      timeSensitive: article.timeSensitive,
      topicId,
    });
    console.log(`Draft ${draft.id} (/${draft.slug}) created with ${hero ? 1 : 0} hero + ${images.length} inline images`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await appPost("/topics", { update: [{ id: topicId, writeError: message.slice(0, 1000) }] }).catch((e: unknown) =>
      console.error("Could not record write error", e),
    );
    throw error;
  }
}

main().catch(async (error: unknown) => {
  console.error(error);
  await reportFailure("Blog writer failed", error);
  process.exit(1);
});
