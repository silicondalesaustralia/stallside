import { prisma } from "@/lib/prisma";
import { websiteAiModel } from "@/lib/website-ai/config";
import type { ImageApiUsage } from "@/lib/website-ai/image-usage";
import type { AiCallResult, AiUsage } from "../ai/result";
import { imageCost, textCost, type CostEstimate } from "./pricing";

export type UsageFeature = "website_build" | "website_followups" | "website_import" | "website_image";
export type UsageOwner = { ownerId: string; storefrontId: string | null; jobId?: string | null };
type Status = "success" | "failed";

async function insert(
  owner: UsageOwner,
  row: { feature: UsageFeature; model: string; status: Status; cost: CostEstimate; usage?: AiUsage; images?: number; image?: ImageApiUsage | null },
): Promise<number> {
  try {
    await prisma.aiUsageEvent.create({
      data: {
        ownerId: owner.ownerId,
        storefrontId: owner.storefrontId,
        jobId: owner.jobId ?? null,
        feature: row.feature,
        model: row.model.slice(0, 80),
        inputTokens: row.usage?.inputTokens ?? row.image?.inputTokens ?? 0,
        cachedInputTokens: row.usage?.cachedInputTokens ?? 0,
        outputTokens: row.usage?.outputTokens ?? row.image?.outputTokens ?? 0,
        reasoningTokens: row.usage?.reasoningTokens ?? 0,
        images: row.images ?? 0,
        costUsdMicros: row.cost.usdMicros,
        costQuality: row.cost.quality,
        pricingVersion: row.cost.version.slice(0, 120),
        status: row.status,
      },
    });
  } catch (err) {
    console.error("[website-ai] usage record failed", row.feature, err instanceof Error ? err.message : err);
  }
  return row.cost.usdMicros ?? 0;
}

/** Records one text model call. Returns its estimated cost (0 when unknown). Never throws. */
export function recordTextUsage(owner: UsageOwner, feature: UsageFeature, model: string, usage: AiUsage, status: Status): Promise<number> {
  return insert(owner, { feature, model, status, usage, cost: textCost(model, usage) });
}

export function recordImageUsage(owner: UsageOwner, model: string, images: number, usage: ImageApiUsage | null): Promise<number> {
  return insert(owner, { feature: "website_image", model, status: "success", images, image: usage, cost: imageCost(model, usage) });
}

/** Records a finished one-off call (follow-ups, imports); pending calls have no usage yet. */
export async function recordCallResult(owner: UsageOwner, feature: UsageFeature, result: AiCallResult<unknown>): Promise<void> {
  if (result.status === "completed") {
    await recordTextUsage(owner, feature, result.model, result.usage, "success");
  } else if (result.status === "error" && result.usage) {
    await recordTextUsage(owner, feature, websiteAiModel(), result.usage, "failed");
  }
}
