"use client";

import type { ReactNode } from "react";
import { useEditor } from "@craftjs/core";
import { storefrontThemeStyle } from "@/lib/storefront/branding-style";
import type { StorefrontPageId } from "@/lib/storefront/types";
import { StorefrontLinkProvider } from "@/components/storefront/StorefrontLinkProvider";
import StorefrontFontLoader from "@/components/storefront/StorefrontFontLoader";
import type { StudioMetadata } from "@/lib/studio/types";
import { resolveStudioTemplate } from "@/lib/studio/templates";
import { resolveHeaderMenu } from "@/lib/studio/header-menu";
import { paletteOf } from "@/lib/website/sections/colour";
import { siteFontHrefs, siteLayoutVars, siteStyleAttrs } from "@/lib/storefront/site-style-vars";
import AnnouncementBarView from "./AnnouncementBarView";
import { useStudioEditorChrome } from "@/components/studio/StudioEditorContext";
import StudioStorefrontNav from "./StudioStorefrontNav";
import StudioStorefrontFooter from "./StudioStorefrontFooter";

const DEFAULT_PAGES: StorefrontPageId[] = ["home", "shop", "about", "contact"];

export default function StudioEditorShell({
  metadata,
  children,
}: {
  metadata: StudioMetadata;
  children: ReactNode;
}) {
  const template = resolveStudioTemplate(metadata.templateId, metadata.businessMode);
  const enabledPages = metadata.enabledPages ?? DEFAULT_PAGES;
  const branding = metadata.resolvedBranding;
  const {
    chromeTarget,
    setChromeTarget,
    headerLayout,
    brandMark,
    logoHeight,
    previewLogoHeight,
    setHeaderStyle,
    sitePageBackground,
    headerMenu,
    announcementBar,
    footer,
    siteButtonColours,
    siteLinkColour,
    navTextSize,
    brandNameSize,
    siteStyle,
  } = useStudioEditorChrome();
  const liveBranding = {
    ...branding,
    ...(sitePageBackground === undefined ? {} : { pageBackground: sitePageBackground }),
    ...(siteButtonColours
      ? { buttonColour: siteButtonColours.background, buttonTextColour: siteButtonColours.text }
      : {}),
    ...(siteLinkColour === undefined ? {} : { linkColour: siteLinkColour }),
    ...(navTextSize === undefined ? {} : { navTextSize }),
    ...(brandNameSize === undefined ? {} : { brandNameSize }),
    ...(siteStyle ? { siteStyle } : {}),
  };
  const { actions } = useEditor();

  function selectHeader() {
    actions.selectNode(undefined);
    setChromeTarget?.("header");
  }

  return (
    <div
      className={`storefront-cq min-h-full text-[var(--ink)] ${template.cssClass}`}
      style={{ ...storefrontThemeStyle(liveBranding), ...template.style, ...siteLayoutVars(liveBranding.siteStyle) }}
      {...siteStyleAttrs(liveBranding.siteStyle)}
    >
      <StorefrontFontLoader fontPairId={branding.fontPairId} extraHrefs={siteFontHrefs(liveBranding.siteStyle)} />
      <StorefrontLinkProvider slug={metadata.storefrontSlug} basePath={metadata.basePath} draft>
        <AnnouncementBarView
          bar={announcementBar ?? null}
          linkContext={{ ...metadata, draft: true }}
          palette={paletteOf(branding)}
          editable
          onSelect={() => {
            actions.selectNode(undefined);
            setChromeTarget?.("announcement");
          }}
        />
        <StudioStorefrontNav
          storefrontSlug={metadata.storefrontSlug}
          standSlug={metadata.standSlug}
          branding={liveBranding}
          activePage="home"
          enabledPages={enabledPages}
          draft
          basePath={metadata.basePath}
          templateId={metadata.templateId}
          hasMenus={metadata.menus.length > 0}
          customNavPages={metadata.customNavPages}
          menuItems={headerMenu ? resolveHeaderMenu(headerMenu, { ...metadata, draft: true }) : null}
          editable
          selected={chromeTarget === "header"}
          onSelect={selectHeader}
          headerLayout={headerLayout}
          brandMark={brandMark}
          logoHeight={logoHeight}
          onLogoResize={previewLogoHeight}
          onLogoResizeEnd={(height) => setHeaderStyle?.({ logoHeight: height })}
        />
        <main
          onClick={() => {
            if (chromeTarget) setChromeTarget?.(null);
          }}
        >
          {children}
        </main>
        <StudioStorefrontFooter
          branding={branding}
          linkContext={{ ...metadata, draft: true }}
          enabledPages={enabledPages}
          templateId={metadata.templateId}
          customFooterPages={metadata.customFooterPages}
          footer={footer ?? null}
          editable
          selected={chromeTarget === "footer"}
          onSelect={() => {
            actions.selectNode(undefined);
            setChromeTarget?.("footer");
          }}
        />
      </StorefrontLinkProvider>
    </div>
  );
}
