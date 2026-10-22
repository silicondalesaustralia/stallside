import { prisma } from "@/lib/prisma";
import { sendOwnerEmail } from "@/lib/notify-email";
import { blogDigestRecipients } from "./digest-recipients";
import { recommendationEmailHtml } from "./recommendation-email";
import { MAX_PICKS_PER_BATCH, type BlogRecommendationsBatch } from "./recommendation-schemas";

const EXPIRE_AFTER_MS = 7 * 86_400_000;

/** Store tonight's ranked ideas as backlog topics and email them with pick links. */
export async function saveAndEmailRecommendations(batch: BlogRecommendationsBatch) {
  const recommendedAt = new Date();
  const ranked = [...batch.recommendations].sort((a, b) => b.score - a.score);
  const topics = await prisma.$transaction(
    ranked.map((rec, index) =>
      prisma.blogTopic.create({
        data: {
          title: rec.title,
          angle: rec.angle,
          notes: rec.whyNow,
          featureRef: rec.vendlTieIn,
          source: rec.source,
          section: rec.section,
          score: rec.score,
          targetQueries: rec.targetQueries,
          sourceUrls: rec.sourceUrls,
          targetPostSlug: rec.targetPostSlug || null,
          expiresAt: rec.timeSensitive ? new Date(recommendedAt.getTime() + EXPIRE_AFTER_MS) : null,
          recommendedAt,
          recommendationRank: index + 1,
        },
      }),
    ),
  );
  const subject = `Tomorrow's blog: pick ${MAX_PICKS_PER_BATCH} of ${topics.length} ideas`;
  await sendOwnerEmail(blogDigestRecipients(), subject, recommendationEmailHtml(topics, batch.summary), {
    kind: "blog-recommendations",
  });
  return topics.map((t) => ({ id: t.id, title: t.title, rank: t.recommendationRank }));
}

/** How many topics from the same evening batch have already been picked. */
export async function picksInBatch(recommendedAt: Date): Promise<number> {
  return prisma.blogTopic.count({
    where: { recommendedAt, selectedAt: { not: null } },
  });
}
