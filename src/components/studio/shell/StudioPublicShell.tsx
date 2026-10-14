"use client";

import type { ReactNode } from "react";
import { storefrontThemeStyle } from "@/lib/storefront/branding";
import { StorefrontLinkProvider } from "@/components/storefront/StorefrontLinkProvider";
import StorefrontFontLoader from "@/components/storefront/StorefrontFontLoader";
import type { StudioMetadata } from "@/lib/studio/types";
import type { StorefrontPageId } from "@/lib/storefront/types";
import { resolveStudioTemplate } from "@/lib/studio/templates";
import { resolveHeaderMenu } from "@/lib/studio/header-menu";
import { paletteOf } from "@/lib/website/sections/colour";
import { siteFontHrefs, siteLayoutVars, siteStyleAttrs } from "@/lib/storefront/site-style";
import AnnouncementBarView from "./AnnouncementBarView";
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
      className={`storefront-cq min-h-full text-[var(--ink)] ${template.cssClass}`}
      style={{ ...storefrontThemeStyle(branding), ...template.style, ...siteLayoutVars(branding.siteStyle) }}
      {...siteStyleAttrs(branding.siteStyle)}
    >
      <StorefrontFontLoader fontPairId={branding.fontPairId} extraHrefs={siteFontHrefs(branding.siteStyle)} />
      <StorefrontLinkProvider slug={metadata.storefrontSlug} basePath={metadata.basePath} draft={draft}>
        <AnnouncementBarView
          bar={metadata.announcementBar}
          linkContext={{ ...metadata, draft }}
          palette={paletteOf(branding)}
        />
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
          menuItems={metadata.headerMenu ? resolveHeaderMenu(metadata.headerMenu, { ...metadata, draft }) : null}
        />
        <main>{children}</main>
        <StudioStorefrontFooter
          branding={branding}
          linkContext={{ ...metadata, draft }}
          enabledPages={metadata.enabledPages}
          templateId={metadata.templateId}
          customFooterPages={metadata.customFooterPages}
          footer={metadata.footer}
        />
      </StorefrontLinkProvider>
    </div>
  );
}
