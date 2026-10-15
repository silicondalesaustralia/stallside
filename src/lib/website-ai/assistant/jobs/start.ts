import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { loadBrief, briefMissingFields } from "../brief/store";
import { aiConfigured, assistantModel } from "../ai/client";

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && e.code === "P2002";
}

export type StartResult = { ok: true; jobId: string } | { ok: false; error: string };

export type BuildMode = "ai" | "basic";

const ACTIVE = ["QUEUED", "RUNNING", "RETRY_WAIT"] as const;

/**
 * Starts one build per storefront. Repeating the same idempotency key returns the same job;
 * a second concurrent build returns the job already running.
 */
export async function startBuild(input: {
  ownerId: string;
  storefrontId: string;
  idempotencyKey: string;
  mode: BuildMode;
}): Promise<StartResult> {
  const existing = await prisma.websiteGenerationJob.findUnique({
    where: { ownerId_idempotencyKey: { ownerId: input.ownerId, idempotencyKey: input.idempotencyKey } },
    select: { id: true },
  });
  if (existing) return { ok: true, jobId: existing.id };

  const brief = await loadBrief(input.ownerId);
  if (!brief) return { ok: false, error: "Add your business details first." };
  const missing = briefMissingFields(brief.data);
  if (missing.length > 0) return { ok: false, error: `Still needed: ${missing.join(", ")}.` };

  const storefront = await prisma.storefront.findFirst({
    where: { id: input.storefrontId, ownerId: input.ownerId },
    select: { draftRevision: true },
  });
  if (!storefront) return { ok: false, error: "Website not found." };

  const mode: BuildMode = input.mode === "ai" && aiConfigured() ? "ai" : "basic";
  try {
    const job = await prisma.$transaction(async (tx) => {
      await tx.websiteGenerationJob.updateMany({
        where: { storefrontId: input.storefrontId, status: "NEEDS_CONFIRMATION" },
        data: { status: "CANCELLED", finishedAt: new Date(), errorCode: "superseded" },
      });
      return tx.websiteGenerationJob.create({
        data: {
          ownerId: input.ownerId,
          storefrontId: input.storefrontId,
          idempotencyKey: input.idempotencyKey,
          activeLock: input.storefrontId,
          mode,
          briefRevision: brief.revision,
          briefSnapshot: brief.data as unknown as Prisma.InputJsonValue,
          baseDraftRevision: storefront.draftRevision,
          modelRequested: mode === "ai" ? assistantModel() : null,
        },
        select: { id: true },
      });
    });
    return { ok: true, jobId: job.id };
  } catch (err) {
    if (isUniqueViolation(err)) {
      const active = await prisma.websiteGenerationJob.findFirst({
        where: { storefrontId: input.storefrontId, status: { in: [...ACTIVE] } },
        select: { id: true },
      });
      if (active) return { ok: true, jobId: active.id };
    }
    console.error("[website-ai] start build failed", err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not start the build. Please try again." };
  }
}
