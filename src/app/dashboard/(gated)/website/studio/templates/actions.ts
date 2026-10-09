"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { normalizeBusinessMode } from "@/lib/business-mode";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { writeStorefrontDraft } from "@/lib/website/persistence/draft-store";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { instantiateTemplate } from "@/lib/website/templates/instantiate";
import { findTemplatePackage } from "@/lib/website/templates/packages";
import { applyTemplateToDraft, undoTemplateOnDraft } from "@/lib/website/templates/restore-point";

const TEMPLATES_PATH = "/dashboard/website/studio/templates";

async function saveGuarded(ownerId: string, expectedRevision: number, draftConfig: Prisma.InputJsonValue) {
  try {
    const saved = await writeStorefrontDraft({ ownerId, expectedRevision, draftConfig });
    return saved.ok ? "ok" : "conflict";
  } catch (err) {
    console.error("[website templates] draft write failed", err);
    return "failed";
  }
}

function revalidateWebsite() {
  revalidatePath(TEMPLATES_PATH);
  revalidatePath("/dashboard/website/web-studio");
  revalidatePath("/dashboard/website/studio");
}

/** Replaces the homepage and shop layouts in the draft; the old ones are kept for undo. */
export async function applyTemplatePackage(packageId: string) {
  const { owner } = await requireWebsiteOwner();
  const mode = normalizeBusinessMode(owner.businessMode);
  const pkg = findTemplatePackage(packageId);
  if (!pkg || !pkg.businessModes.includes(mode)) redirect(`${TEMPLATES_PATH}?error=invalid`);

  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const identity = parseStorefrontConfig(storefront.draftConfig).identity ?? {};
  const instance = instantiateTemplate(pkg, {
    businessName: owner.businessName,
    businessMode: mode,
    headline: identity.headline ?? storefront.headline,
    subheadline: identity.subheadline ?? storefront.subheadline,
    about: identity.about ?? storefront.about,
  });
  if (instance.diagnostics.some((d) => d.severity === "error")) {
    console.error("[website templates] package failed to instantiate", pkg.id, instance.diagnostics);
    redirect(`${TEMPLATES_PATH}?error=invalid`);
  }

  const draft = applyTemplateToDraft(storefront.draftConfig, pkg.id, instance, new Date());
  const result = await saveGuarded(owner.id, storefront.draftRevision, draft);
  if (result !== "ok") redirect(`${TEMPLATES_PATH}?error=${result}`);
  revalidateWebsite();
  redirect(`${TEMPLATES_PATH}?applied=${pkg.id}`);
}

export async function undoTemplatePackage() {
  const { owner } = await requireWebsiteOwner();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const draft = undoTemplateOnDraft(storefront.draftConfig);
  if (!draft) redirect(TEMPLATES_PATH);
  const result = await saveGuarded(owner.id, storefront.draftRevision, draft);
  if (result !== "ok") redirect(`${TEMPLATES_PATH}?error=${result}`);
  revalidateWebsite();
  redirect(`${TEMPLATES_PATH}?undone=1`);
}
