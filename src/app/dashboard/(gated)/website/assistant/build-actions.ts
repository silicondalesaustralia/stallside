"use server";

import { revalidatePath } from "next/cache";
import { requireAssistantOwner } from "@/lib/website-ai/assistant/load-wizard";
import { startBuild, type BuildMode } from "@/lib/website-ai/assistant/jobs/start";
import { kickJobIfIdle } from "@/lib/website-ai/assistant/jobs/kick";
import { cancelJob, confirmReplace, restorePrevious } from "@/lib/website-ai/assistant/jobs/control";
import { markPolicyReviewed } from "@/lib/website-ai/assistant/review";

export type BuildActionResult = { ok: true; jobId?: string } | { ok: false; error: string };

function revalidateWebsite() {
  revalidatePath("/dashboard/website/web-studio");
  revalidatePath("/dashboard/website/assistant");
  revalidatePath("/dashboard/website/pages");
}

async function run(label: string, fn: (ownerId: string, storefrontId: string) => Promise<BuildActionResult>): Promise<BuildActionResult> {
  try {
    const { owner, storefront } = await requireAssistantOwner();
    const result = await fn(owner.id, storefront.id);
    if (result.ok) revalidateWebsite();
    return result;
  } catch (err) {
    console.error(`[website-ai] ${label} failed`, err instanceof Error ? err.message : err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function startBuildAction(idempotencyKey: string, mode: BuildMode): Promise<BuildActionResult> {
  return run("start build", async (ownerId, storefrontId) => {
    const key = idempotencyKey.trim().slice(0, 80);
    if (!key) return { ok: false, error: "Missing request key." };
    const started = await startBuild({ ownerId, storefrontId, idempotencyKey: key, mode });
    if (!started.ok) return started;
    await kickJobIfIdle(started.jobId);
    return { ok: true, jobId: started.jobId };
  });
}

export async function cancelBuildAction(jobId: string): Promise<BuildActionResult> {
  return run("cancel build", (ownerId) => cancelJob(ownerId, jobId));
}

export async function confirmReplaceAction(jobId: string): Promise<BuildActionResult> {
  return run("confirm replace", async (ownerId) => {
    const res = await confirmReplace(ownerId, jobId);
    if (res.ok) await kickJobIfIdle(jobId);
    return res;
  });
}

export async function restorePreviousAction(jobId: string): Promise<BuildActionResult> {
  return run("restore", (ownerId) => restorePrevious(ownerId, jobId));
}

export async function markPolicyReviewedAction(pageId: string): Promise<BuildActionResult> {
  return run("policy review", (ownerId) => markPolicyReviewed(ownerId, pageId));
}
