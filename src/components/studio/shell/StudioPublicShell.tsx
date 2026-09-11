"use client";

import type { ReactNode } from "react";
import { storefrontThemeStyle } from "@/lib/storefront/branding";
import { StorefrontLinkProvider } from "@/components/storefront/StorefrontLinkProvider";
import StorefrontFontLoader from "@/components/storefront/StorefrontFontLoader";
import type { StudioMetadata } from "@/lib/studio/types";
import type { StorefrontPageId } from "@/lib/storefront/types";
import { resolveStudioTemplate } from "@/lib/studio/templates";
import StudioStorefrontNav from "./StudioStorefrontNav";
import StudioStorefrontFooter from "./StudioStorefrontFooter";

export default function StudioPublicShell({
  metadata,
  draft,
  activePage = "home",
  children,
}: {
  metadata: StudioMetadata;
  draft?: boolean;
  activePage?: StorefrontPageId | "product" | "menu" | string;
  children: ReactNode;
}) {
  const template = resolveStudioTemplate(metadata.templateId, metadata.businessMode);
  const branding = metadata.resolvedBranding;

  return (
    <div
      className={`min-h-full text-[var(--ink)] ${template.cssClass}`}
      style={{ ...storefrontThemeStyle(branding), ...template.style }}
    >
      <StorefrontFontLoader fontPairId={branding.fontPairId} />
      <StorefrontLinkProvider slug={metadata.storefrontSlug} basePath={metadata.basePath} draft={draft}>
        <StudioStorefrontNav
          storefrontSlug={metadata.storefrontSlug}
          standSlug={metadata.standSlug}
          branding={branding}
          activePage={activePage}
          enabledPages={metadata.enabledPages}
          draft={draft}
          basePath={metadata.basePath}
          templateId={metadata.templateId}
          hasMenus={metadata.menus.length > 0}
          customNavPages={metadata.customNavPages}
        />
        <main>{children}</main>
        <StudioStorefrontFooter
          branding={branding}
          storefrontSlug={metadata.storefrontSlug}
          enabledPages={metadata.enabledPages}
          draft={draft}
          basePath={metadata.basePath}
          templateId={metadata.templateId}
          customFooterPages={metadata.customFooterPages}
        />
      </StorefrontLinkProvider>
    </div>
  );
}
