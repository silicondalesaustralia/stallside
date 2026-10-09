import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { writeStorefrontDraft } from "./draft-store";

/** Guarded draft write for form actions: on conflict, redirect back with an error. */
export async function writeDraftOrRedirect(input: {
  ownerId: string;
  expectedRevision: number;
  draftConfig: Prisma.InputJsonValue;
  conflictPath: string;
}): Promise<number> {
  const saved = await writeStorefrontDraft(input);
  if (!saved.ok) {
    const joiner = input.conflictPath.includes("?") ? "&" : "?";
    redirect(`${input.conflictPath}${joiner}error=conflict`);
  }
  return saved.revision;
}
