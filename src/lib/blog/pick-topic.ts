import { prisma } from "@/lib/prisma";
import { dispatchBlogWrite } from "./github-dispatch";
import { MAX_PICKS_PER_BATCH } from "./recommendation-schemas";
import { picksInBatch } from "./recommendations";

export type PickResult =
  | { ok: true; title: string }
  | { ok: false; reason: string };

/** Claim a topic (once), enforce the per-evening limit, then start the writer. */
export async function pickBlogTopic(topicId: string): Promise<PickResult> {
  const topic = await prisma.blogTopic.findUnique({ where: { id: topicId } });
  if (!topic) return { ok: false, reason: "This idea no longer exists." };
  if (topic.selectedAt) return { ok: false, reason: "Already picked. The draft is on its way to the review queue." };
  if (topic.status !== "IDEA") return { ok: false, reason: `This idea is ${topic.status.toLowerCase()}, so it can't be written.` };
  if (topic.recommendedAt && (await picksInBatch(topic.recommendedAt)) >= MAX_PICKS_PER_BATCH) {
    return { ok: false, reason: `You've already picked ${MAX_PICKS_PER_BATCH} from this evening's list.` };
  }

  const claimed = await prisma.blogTopic.updateMany({
    where: { id: topicId, selectedAt: null, status: "IDEA" },
    data: { status: "SELECTED", selectedAt: new Date(), writeError: null },
  });
  if (claimed.count === 0) return { ok: false, reason: "Already picked." };

  try {
    await dispatchBlogWrite(topicId);
    return { ok: true, title: topic.title };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start the writer";
    console.error("[blog] pick dispatch failed", error);
    await prisma.blogTopic.update({
      where: { id: topicId },
      data: { status: "IDEA", selectedAt: null, writeError: message.slice(0, 1000) },
    });
    return { ok: false, reason: `Couldn't start writing: ${message}` };
  }
}
