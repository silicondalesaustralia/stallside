import Link from "next/link";
import { requireOwner } from "@/lib/session";
import {
  ensureStorefront,
  loadStorefrontContext,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import { appBaseUrl } from "@/lib/app-url";
import { extractWebsiteStudio, defaultTemplateId } from "@/lib/studio/storage";
import { buildStudioMetadata } from "@/lib/studio/build-metadata";
import type { StudioTemplateId } from "@/lib/studio/types";
import StudioEditor from "@/components/studio/StudioEditor";

function resolveTemplateId(
  stored: ReturnType<typeof extractWebsiteStudio>,
  param: string | undefined,
  businessMode: import("@/lib/business-mode").BusinessMode,
): StudioTemplateId {
  if (param === "artisan" || param === "farmhouse" || param === "market") return param;
  return defaultTemplateId(stored ?? null, businessMode);
}

export default async function WebsiteStudioPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    published?: string;
    error?: string;
    template?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);

  const ctx = await loadStorefrontContext(storefront.slug, {
    draft: true,
    ownerId: owner.id,
  });
  if (!ctx) throw new Error("Storefront context unavailable");

  const websiteStudio = extractWebsiteStudio(storefront.draftConfig);
  const templateId = resolveTemplateId(
    websiteStudio,
    params.template,
    ctx.businessMode,
  );
  const metadata = await buildStudioMetadata(ctx, templateId, true);
  const base = appBaseUrl();
  const previewUrl = `${base}${storefrontPublicPath(storefront.slug)}/studio-preview?draft=1`;

  const showNextDrop =
    ctx.businessMode === "FOOD_BUSINESS" || ctx.businessMode === "BOTH";

  return (
    <main className="flex flex-col gap-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
            Website studio
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Drag sections onto your homepage, edit in place, then publish when ready.
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            <Link href="/dashboard/website/studio/templates" className="underline">
              Change template
            </Link>
            {" · "}
            <Link href="/dashboard/website/details" className="underline">
              Shop details
            </Link>
          </p>
        </div>
      </div>
      <StudioEditor
        initialNodes={websiteStudio?.nodes ?? null}
        metadata={metadata}
        templateId={templateId}
        previewUrl={previewUrl}
        isPublished={storefront.isPublished}
        starter={{
          headline: storefront.headline ?? owner.businessName,
          subheadline: storefront.subheadline,
          about: storefront.about,
          showNextDrop,
        }}
        saved={params.saved === "1"}
        published={params.published === "1"}
        error={params.error}
      />
    </main>
  );
}
