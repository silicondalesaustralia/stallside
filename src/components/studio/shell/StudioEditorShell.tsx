"use client";

import type { ReactNode } from "react";
import { useEditor } from "@craftjs/core";
import { storefrontThemeStyle } from "@/lib/storefront/branding";
import type { StorefrontPageId } from "@/lib/storefront/types";
import { StorefrontLinkProvider } from "@/components/storefront/StorefrontLinkProvider";
import StorefrontFontLoader from "@/components/storefront/StorefrontFontLoader";
import type { StudioMetadata } from "@/lib/studio/types";
import { resolveStudioTemplate } from "@/lib/studio/templates";
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
  const { chromeTarget, setChromeTarget, headerLayout, brandMark } = useStudioEditorChrome();
  const { actions } = useEditor();

  function selectHeader() {
    actions.selectNode(undefined);
    setChromeTarget?.("header");
  }

  return (
    <div
      className={`min-h-full text-[var(--ink)] ${template.cssClass}`}
      style={{ ...storefrontThemeStyle(branding), ...template.style }}
    >
      <StorefrontFontLoader fontPairId={branding.fontPairId} />
      <StorefrontLinkProvider slug={metadata.storefrontSlug} basePath={metadata.basePath} draft>
        <StudioStorefrontNav
          storefrontSlug={metadata.storefrontSlug}
          standSlug={metadata.standSlug}
          branding={branding}
          activePage="home"
          enabledPages={enabledPages}
          draft
          basePath={metadata.basePath}
          templateId={metadata.templateId}
          hasMenus={metadata.menus.length > 0}
          editable
          selected={chromeTarget === "header"}
          onSelect={selectHeader}
          headerLayout={headerLayout}
          brandMark={brandMark}
        />
        <main
          onClick={() => {
            if (chromeTarget === "header") setChromeTarget?.(null);
          }}
        >
          {children}
        </main>
        <StudioStorefrontFooter
          branding={branding}
          storefrontSlug={metadata.storefrontSlug}
          enabledPages={enabledPages}
          draft
          basePath={metadata.basePath}
          templateId={metadata.templateId}
        />
      </StorefrontLinkProvider>
    </div>
  );
}
