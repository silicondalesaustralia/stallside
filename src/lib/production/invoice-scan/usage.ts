import { prisma } from "@/lib/prisma";
import type { ScanUsage } from "./extract";

export const INVOICE_SCAN_FEATURE = "invoice_scan";
const MONTHLY_SCAN_LIMIT = 100;
const PRICING_VERSION = "invoice-scan-v1";

/** USD per 1M tokens for models we know; others are stored as unknown cost. */
const RATES: Record<string, { input: number; cached: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, cached: 0.075, output: 0.6 },
  "gpt-4o": { input: 2.5, cached: 1.25, output: 10 },
};

function costUsdMicros(model: string, usage: ScanUsage): number | null {
  const rate = Object.entries(RATES).find(([prefix]) => model.startsWith(prefix))?.[1];
  if (!rate) return null;
  const cached = Math.min(usage.cachedInputTokens, usage.inputTokens);
  return Math.round((usage.inputTokens - cached) * rate.input + cached * rate.cached + usage.outputTokens * rate.output);
}

export async function scanLimitReached(ownerId: string): Promise<boolean> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const count = await prisma.aiUsageEvent.count({
    where: { ownerId, feature: INVOICE_SCAN_FEATURE, createdAt: { gte: since } },
  });
  return count >= MONTHLY_SCAN_LIMIT;
}

/** Never throws: usage logging must not break a scan. */
export async function recordScanUsage(
  ownerId: string,
  model: string,
  usage: ScanUsage | null,
  status: "success" | "failed",
): Promise<void> {
  try {
    const micros = usage ? costUsdMicros(model, usage) : null;
    await prisma.aiUsageEvent.create({
      data: {
        ownerId,
        feature: INVOICE_SCAN_FEATURE,
        model: model.slice(0, 80),
        inputTokens: usage?.inputTokens ?? 0,
        cachedInputTokens: usage?.cachedInputTokens ?? 0,
        outputTokens: usage?.outputTokens ?? 0,
        costUsdMicros: micros,
        costQuality: micros == null ? "unknown" : "estimated",
        pricingVersion: PRICING_VERSION,
        status,
      },
    });
  } catch (err) {
    console.error("[invoice-scan] usage record failed", err instanceof Error ? err.message : err);
  }
}
