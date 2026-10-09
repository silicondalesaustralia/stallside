import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const DRAFT_CONFLICT_MESSAGE =
  "Your website was changed somewhere else (another tab or device). Reload to get the latest version, then try again.";

export class DraftConflictError extends Error {
  constructor() {
    super(DRAFT_CONFLICT_MESSAGE);
    this.name = "DraftConflictError";
  }
}

type ExtraStorefrontData = Omit<
  Prisma.StorefrontUpdateManyMutationInput,
  "draftConfig" | "draftRevision"
>;

export type DraftWriteResult =
  | { ok: true; revision: number }
  | { ok: false; reason: "conflict" };

/**
 * Writes the whole draft only if nobody else wrote since `expectedRevision`
 * was read. Every website draft writer must go through here.
 */
export async function writeStorefrontDraft(input: {
  ownerId: string;
  expectedRevision: number;
  draftConfig: Prisma.InputJsonValue;
  data?: ExtraStorefrontData;
}): Promise<DraftWriteResult> {
  const result = await prisma.storefront.updateMany({
    where: { ownerId: input.ownerId, draftRevision: input.expectedRevision },
    data: {
      ...input.data,
      draftConfig: input.draftConfig,
      draftRevision: { increment: 1 },
    },
  });
  if (result.count === 0) return { ok: false, reason: "conflict" };
  return { ok: true, revision: input.expectedRevision + 1 };
}

export async function writeStorefrontDraftOrThrow(
  input: Parameters<typeof writeStorefrontDraft>[0],
): Promise<number> {
  const result = await writeStorefrontDraft(input);
  if (!result.ok) throw new DraftConflictError();
  return result.revision;
}

export function parseExpectedRevision(raw: unknown): number | null {
  const value = typeof raw === "number" ? raw : Number(String(raw ?? ""));
  return Number.isInteger(value) && value >= 0 ? value : null;
}
