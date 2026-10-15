import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { BRIEF_SCHEMA_VERSION, briefDataSchema, parseBriefData, type BriefData } from "./schema";

export type StoredBrief = { data: BriefData; revision: number; exists: boolean };

export async function loadBrief(ownerId: string): Promise<StoredBrief | null> {
  const row = await prisma.websiteBusinessBrief.findUnique({ where: { ownerId } });
  if (!row) return null;
  return { data: parseBriefData(row.data), revision: row.revision, exists: true };
}

export type BriefSaveResult =
  | { ok: true; revision: number }
  | { ok: false; reason: "conflict" | "invalid"; message: string };

/**
 * Saves the brief only if nobody else saved since `expectedRevision` (create when -1).
 * Never touches the website draft or live settings.
 */
export async function saveBrief(input: {
  ownerId: string;
  storefrontId: string;
  expectedRevision: number;
  data: BriefData;
}): Promise<BriefSaveResult> {
  const parsed = briefDataSchema.safeParse(input.data);
  if (!parsed.success) {
    return { ok: false, reason: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid details." };
  }
  const data = parsed.data as unknown as Prisma.InputJsonValue;

  if (input.expectedRevision < 0) {
    try {
      const created = await prisma.websiteBusinessBrief.create({
        data: {
          ownerId: input.ownerId,
          storefrontId: input.storefrontId,
          schemaVersion: BRIEF_SCHEMA_VERSION,
          revision: 1,
          data,
        },
      });
      return { ok: true, revision: created.revision };
    } catch (err) {
      console.error("[website-ai] brief create failed", err instanceof Error ? err.message : err);
      return { ok: false, reason: "conflict", message: "Your details were saved in another tab. Reload to continue." };
    }
  }

  const result = await prisma.websiteBusinessBrief.updateMany({
    where: { ownerId: input.ownerId, revision: input.expectedRevision },
    data: { data, schemaVersion: BRIEF_SCHEMA_VERSION, revision: { increment: 1 } },
  });
  if (result.count === 0) {
    return { ok: false, reason: "conflict", message: "Your details were changed in another tab. Reload to continue." };
  }
  return { ok: true, revision: input.expectedRevision + 1 };
}

export { briefMissingFields } from "./missing";
