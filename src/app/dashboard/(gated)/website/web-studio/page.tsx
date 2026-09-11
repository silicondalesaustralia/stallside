import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  ensureStorefront,
  loadStorefrontContext,
  storefrontFullUrl,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import { appBaseUrl } from "@/lib/app-url";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { parseAccentColor } from "@/lib/stand-brand";
import { extractWebsiteStudio, defaultTemplateId } from "@/lib/studio/storage";
import { buildStudioMetadata } from "@/lib/studio/build-metadata";
import type { StudioTemplateId } from "@/lib/studio/types";
import { extractWebsiteAiScaffold } from "@/lib/website-ai/scaffold-storage";
import { canUseAiWebsiteBuilder, aiWebsiteBuilderEnabled } from "@/lib/website-ai/config";
import { buildWebsiteBusinessContext } from "@/lib/website-ai/business-context";
import { assessWebsiteContext } from "@/lib/website-ai/assess-context";
import type { BrandLookCombo } from "@/lib/website/brand-looks";
import {
  parseWebStudioTab,
  type WebStudioTabId,
} from "@/lib/website/web-studio-nav";
import WebStudioShell from "@/components/website/WebStudioShell";
import WebStudioDetailsPanel from "@/components/website/WebStudioDetailsPanel";
import WebStudioBrandingPanel from "@/components/website/WebStudioBrandingPanel";
import WebStudioAiPanel from "@/components/website/WebStudioAiPanel";
import WebStudioLayoutPanel from "@/components/website/WebStudioLayoutPanel";

function resolveTemplateId(
  stored: ReturnType<typeof extractWebsiteStudio>,
  param: string | undefined,
  businessMode: import("@/lib/business-mode").BusinessMode,
): StudioTemplateId {
  if (param === "artisan" || param === "farmhouse" || param === "market") return param;
  return defaultTemplateId(stored ?? null, businessMode);
}

export default async function WebStudioPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    saved?: string;
    published?: string;
    unpublished?: string;
    error?: string;
    template?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const initialTab: WebStudioTabId = parseWebStudioTab(sp.tab);
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const stand = await prisma.stand.findFirst({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "asc" },
    select: { logoUrl: true, accentColor: true, secondaryColor: true },
  });

  const ctx = await loadStorefrontContext(storefront.slug, {
    draft: true,
    ownerId: owner.id,
  });
  if (!ctx) throw new Error("Storefront context unavailable");

  const websiteStudio = extractWebsiteStudio(storefront.draftConfig);
  const templateId = resolveTemplateId(
    websiteStudio,
    sp.template,
    ctx.businessMode,
  );
  const metadata = await buildStudioMetadata(ctx, templateId, true);
  const previewUrl = `${appBaseUrl()}${storefrontPublicPath(storefront.slug)}/studio-preview?draft=1`;
  const showNextDrop =
    ctx.businessMode === "FOOD_BUSINESS" || ctx.businessMode === "BOTH";

  const logoUrl = owner.brandLogoUrl ?? stand?.logoUrl ?? null;
  const overrides = parseStorefrontConfig(storefront.draftConfig).themeOverrides;
  const accentColor =
    parseAccentColor(overrides?.accentColor) ??
    parseAccentColor(owner.brandAccentColor) ??
    parseAccentColor(stand?.accentColor) ??
    "#2e7d3f";
  const secondaryColor =
    parseAccentColor(overrides?.secondaryColor) ??
    parseAccentColor(owner.brandSecondaryColor) ??
    parseAccentColor(stand?.secondaryColor) ??
    accentColor;

  const aiEnabled = aiWebsiteBuilderEnabled();
  const aiAllowed = canUseAiWebsiteBuilder(owner.id);
  let assessment: ReturnType<typeof assessWebsiteContext> | undefined;
  let scaffoldLooks: BrandLookCombo[] = [];
  if (aiEnabled && aiAllowed) {
    const businessContext = await buildWebsiteBusinessContext(ctx);
    assessment = assessWebsiteContext(businessContext);
    scaffoldLooks = extractWebsiteAiScaffold(storefront.draftConfig)?.looks ?? [];
  }

  const previewPath = `${storefrontPublicPath(storefront.slug)}/studio-preview?draft=1`;

  return (
    <main>
      <WebStudioShell
        initialTab={initialTab}
        details={
          <WebStudioDetailsPanel
            headline={storefront.headline ?? owner.businessName}
            subheadline={storefront.subheadline ?? ""}
            about={storefront.about ?? ""}
            slug={storefront.slug}
            contactEmail={storefront.contactEmail ?? owner.contactEmail}
            showPhone={storefront.showPhone}
            isPublished={storefront.isPublished}
            liveUrl={storefrontFullUrl(storefront.slug)}
            flash={{
              saved: sp.saved === "1" && initialTab === "details",
              published: sp.published === "1" && initialTab === "details",
              unpublished: sp.unpublished === "1" && initialTab === "details",
              error: initialTab === "details" ? sp.error : undefined,
            }}
          />
        }
        branding={
          <WebStudioBrandingPanel
            logoUrl={logoUrl}
            faviconUrl={storefront.faviconUrl}
            heroImageUrl={storefront.heroImageUrl}
            accentColor={accentColor}
            secondaryColor={secondaryColor}
            flash={{
              saved: sp.saved === "1" && initialTab === "branding",
              error: initialTab === "branding" && Boolean(sp.error),
            }}
          />
        }
        ai={
          <WebStudioAiPanel
            enabled={aiEnabled}
            allowed={aiAllowed}
            assessment={assessment}
            previewPath={previewPath}
            initialLooks={scaffoldLooks}
            draftTemplateId={websiteStudio?.templateId ?? null}
            publishedFlash={sp.published === "1" && initialTab === "ai"}
          />
        }
        studio={
          <WebStudioLayoutPanel
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
            flash={{
              saved: sp.saved === "1" && initialTab === "studio",
              published: sp.published === "1" && initialTab === "studio",
              error: initialTab === "studio" ? sp.error : undefined,
            }}
          />
        }
      />
    </main>
  );
}
