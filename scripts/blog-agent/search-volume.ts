import type { BlogRecommendationsBatch } from "../../src/lib/blog/recommendation-schemas";
import { keywordOverview } from "./keyword-data";

/** Attach Google Australia volume, difficulty and intent to every target query; highest volume first. */
export async function addSearchVolumes(batch: BlogRecommendationsBatch): Promise<BlogRecommendationsBatch> {
  const queries = batch.recommendations.flatMap((rec) => (rec.targetQueries ?? []).map((q) => q.query));
  const metrics = await keywordOverview(queries);
  if (metrics.size === 0) return batch;
  console.log(`Search volumes found for ${metrics.size} of ${new Set(queries).size} target queries`);
  return {
    ...batch,
    recommendations: batch.recommendations.map((rec) => ({
      ...rec,
      targetQueries: rec.targetQueries
        ?.map((q) => {
          const m = metrics.get(q.query.trim().toLowerCase());
          return m ? { ...q, volume: m.volume, difficulty: m.difficulty === null ? null : Math.round(m.difficulty), intent: m.intent } : q;
        })
        .sort((a, b) => (b.volume ?? -1) - (a.volume ?? -1)),
    })),
  };
}
