import { processCampaignSendBatch } from "@/lib/grow/campaigns";

const MAX_BATCHES_PER_RUN = 10;

export async function drainCampaignSends(): Promise<number> {
  let total = 0;
  for (let i = 0; i < MAX_BATCHES_PER_RUN; i += 1) {
    const result = await processCampaignSendBatch();
    total += result.processed;
    if (!result.processed || result.finished) break;
  }
  return total;
}
