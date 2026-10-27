/**
 * Writer: research and draft one picked topic (new post or update) with images. Topics entered by
 * the owner (a keyword or phrase, no planner research yet) are briefed first by keyword-brief.ts.
 *
 *   npx tsx scripts/blog-agent/write.ts --topic <topicId>
 *
 * Env: BLOG_AGENT_BASE_URL, BLOG_AGENT_TOKEN, OPENAI_API_KEY.
 */
import "dotenv/config";
import { appGet, appPost, reportFailure } from "./api";
import { ARTICLE_JSON_SHAPE, articleSchema, type AgentArticle } from "./article-schema";
import { folderFor, inlineImages } from "./article-images";
import { insertFigures } from "./figures";
import { fixInternalLinks } from "./internal-links";
import { normalizeArticle } from "./normalize-article";
import { tryCreatePostImage, uniqueFilenames } from "./images";
import { linkablePages, type BlogContext } from "./compact-context";
import { relevantKnowledge } from "./knowledge-select";
import { gatherOfficialFacts } from "./official-facts";
import { askJson } from "./openai";
import { agentDoc, playbookFor, todayInAdelaide, vendlFactsSource } from "./repo-context";
import { briefTopic, needsBrief } from "./keyword-brief";
import { buildSerpBrief } from "./serp-brief";
import { titlesTooSimilar } from "./title-variation";
import type { TargetPost, Topic } from "./topic";

function topicIdArg(): string {
  const index = process.argv.indexOf("--topic");
  const id = index >= 0 ? process.argv[index + 1]?.trim() : "";
  if (!id) throw new Error("Pass --topic <topicId>");
  return id;
}

async function draftArticle(topic: Topic, targetPost: TargetPost | null): Promise<AgentArticle> {
  const today = todayInAdelaide();
  const [context, serpBrief, officialFacts, knowledgeBase] = await Promise.all([
    appGet<BlogContext>("/context"),
    buildSerpBrief(topic, targetPost),
    gatherOfficialFacts(topic, today),
    relevantKnowledge([topic.title, topic.angle, topic.featureRef, topic.notes].filter(Boolean).join(" ")),
  ]);
  const task = targetPost
    ? "Propose an update to the published post in targetPost. Return the complete revised bodyHtml and changeNotes."
    : "Write a complete new post for this topic.";
  const raw = await askJson({
    task: "WRITE",
    instructions: [
      "You are the writer for Vendl's blog. Follow the playbook and writing standard exactly.",
      playbookFor("WRITE"),
      agentDoc("WRITING"),
      `Return only a json object with this shape:\n${ARTICLE_JSON_SHAPE}`,
    ].join("\n\n"),
    input: `${task} Research is done: state external facts only from officialFacts and serpBrief (cite their URLs); if something the article needs is missing, keep it general and list it in researchNotes as unverified. Today is ${today}.\n${JSON.stringify({
      topic,
      targetPost,
      serpBrief,
      officialFacts,
      linkablePages: linkablePages(context),
      vendlFactFiles: vendlFactsSource(),
      knowledgeBase,
    })}`,
  });
  const parsed = articleSchema.safeParse(normalizeArticle(raw));
  if (!parsed.success) {
    throw new Error(`Writer output failed validation: ${JSON.stringify(parsed.error.issues).slice(0, 1500)}`);
  }
  if (!titlesTooSimilar(parsed.data.title, parsed.data.seoTitle)) return parsed.data;
  console.warn("H1 and SEO title are near-identical");
  return { ...parsed.data, agentSummary: `${parsed.data.agentSummary} Note: the H1 and SEO title are near-identical; vary one before publishing.`.slice(0, 2000) };
}

async function main() {
  const topicId = topicIdArg();
  try {
    const loaded = await appGet<{ topic: Topic; targetPost: TargetPost | null }>(`/topics/${topicId}`);
    const { targetPost } = loaded;
    const topic = needsBrief(loaded.topic) ? await briefTopic(loaded.topic) : loaded.topic;
    if (topic.targetPostSlug && !targetPost) throw new Error(`Post /${topic.targetPostSlug} is no longer published`);
    const article = await fixInternalLinks(await draftArticle(topic, targetPost));
    const folder = folderFor(article, targetPost?.slug ?? null);

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
        ? tryCreatePostImage({ folder, filename: uniqueFilenames([heroBrief])[0].filename, prompt: heroBrief.prompt, shape: "landscape", kind: "hero" })
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
    console.log(`H1: ${article.title}\nSEO title: ${article.seoTitle}`);
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
