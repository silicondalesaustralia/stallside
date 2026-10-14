"use server";

import { revalidatePath } from "next/cache";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { writeDraftConfigKey, type DraftKeyResult } from "@/lib/website/persistence/draft-key";
import { headerMenuProblem, headerMenuSchema, type HeaderMenu } from "@/lib/studio/header-menu";
import { announcementBarProblem, announcementBarSchema, type AnnouncementBar } from "@/lib/studio/announcement-bar";

/** Saves the seller's header menu to the draft, or clears it (null) to go back to automatic. */
export async function saveStorefrontHeaderMenu(input: {
  menu: unknown;
  expectedRevision: number;
}): Promise<DraftKeyResult> {
  const { owner } = await requireWebsiteOwner();
  let menu: HeaderMenu | null = null;
  if (input.menu !== null) {
    const parsed = headerMenuSchema.safeParse(input.menu);
    if (!parsed.success) return { ok: false, error: "Every link needs text and a page, product or web address." };
    const problem = headerMenuProblem(parsed.data);
    if (problem) return { ok: false, error: problem };
    menu = parsed.data;
  }
  try {
    const result = await writeDraftConfigKey({ owner, key: "headerMenu", value: menu, expectedRevision: input.expectedRevision });
    if (result.ok) revalidatePath("/dashboard/website/navigation");
    return result;
  } catch (err) {
    console.error("[header menu save]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not save the header menu." };
  }
}

/** Saves the announcement bar (text, link, styling, on/off) to the draft. */
export async function saveStorefrontAnnouncementBar(input: {
  bar: unknown;
  expectedRevision: number;
}): Promise<DraftKeyResult> {
  const { owner } = await requireWebsiteOwner();
  const parsed = announcementBarSchema.safeParse(input.bar);
  if (!parsed.success) return { ok: false, error: "Check the announcement text and link." };
  const bar: AnnouncementBar = parsed.data;
  const problem = announcementBarProblem(bar);
  if (problem) return { ok: false, error: problem };
  try {
    return await writeDraftConfigKey({ owner, key: "announcementBar", value: bar, expectedRevision: input.expectedRevision });
  } catch (err) {
    console.error("[announcement bar save]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not save the announcement bar." };
  }
}
