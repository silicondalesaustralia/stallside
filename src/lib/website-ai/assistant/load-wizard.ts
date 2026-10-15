import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureStorefront, loadStorefrontContext, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { studioEditorPath } from "@/lib/studio/editor-target";
import { extractWebsiteAiScaffold } from "@/lib/website-ai/scaffold-storage";
import { assistantEnabledFor } from "./access";
import { buildAssistantContext } from "./context/build";
import { searchProfileSummary } from "./context/search-profile";
import { loadBrief } from "./brief/store";
import { prefillBrief } from "./brief/prefill";
import type { BriefData } from "./brief/schema";
import { featureNotes, pageOptions, type PageOption } from "./pages/catalogue";
import { aiConfigured } from "./ai/client";

/** Session for assistant server actions: website allowlist + AI builder allowlist. */
export async function requireAssistantOwner() {
  const session = await requireWebsiteOwner();
  if (!assistantEnabledFor(session.owner.id)) redirect("/dashboard/website/web-studio");
  const storefront = await ensureStorefront(session.owner.id, session.owner.businessName);
  return { owner: session.owner, storefront };
}

export type WizardData = {
  brief: BriefData;
  briefRevision: number;
  pageOptions: PageOption[];
  featureNotes: string[];
  hasExistingSite: boolean;
  isPublished: boolean;
  aiAvailable: boolean;
  activeJobId: string | null;
  lastJobId: string | null;
  previewPath: string;
  editorHref: string;
  searchProfile: { complete: boolean; summary: string[] };
};

export async function loadWizardData(): Promise<WizardData> {
  const { owner, storefront } = await requireAssistantOwner();
  const ctx = await loadStorefrontContext(storefront.slug, { draft: true, ownerId: owner.id });
  if (!ctx) throw new Error("Storefront context unavailable");
  const assistant = await buildAssistantContext(ctx);
  const stored = await loadBrief(owner.id);
  const brief = stored?.data ?? prefillBrief(assistant, extractWebsiteAiScaffold(storefront.draftConfig)?.intent);
  const jobs = await prisma.websiteGenerationJob.findMany({
    where: { ownerId: owner.id, storefrontId: storefront.id },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: { id: true, status: true },
  });
  const last = jobs[0] ?? null;
  const active = last && ["QUEUED", "RUNNING", "RETRY_WAIT", "NEEDS_CONFIRMATION"].includes(last.status);
  return {
    brief,
    briefRevision: stored?.revision ?? -1,
    pageOptions: pageOptions(assistant, brief),
    featureNotes: featureNotes(assistant),
    hasExistingSite: assistant.existing.hasLayout,
    isPublished: assistant.existing.isPublished,
    aiAvailable: aiConfigured(),
    activeJobId: active ? last.id : null,
    lastJobId: last?.id ?? null,
    previewPath: `${storefrontPublicPath(storefront.slug)}/studio-preview?draft=1`,
    editorHref: studioEditorPath(storefront.slug),
    searchProfile: {
      complete: assistant.searchProfile.complete,
      summary: searchProfileSummary(assistant.searchProfile),
    },
  };
}
