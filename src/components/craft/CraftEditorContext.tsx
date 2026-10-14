"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import type { CraftSpikeMetadata } from "@/lib/craft/types";
import type { BusinessMode } from "@/lib/business-mode";
import type { StudioTemplateId } from "@/lib/studio/types";
import type { CommercePageKind } from "@/lib/studio/commerce-pages";
import type { BrandMarkMode, HeaderLayout } from "@/lib/storefront/header-style";
import type { HeaderMenu } from "@/lib/studio/header-menu";
import type { AnnouncementBar } from "@/lib/studio/announcement-bar";
import type { FooterSettings } from "@/lib/studio/footer-settings";
import type { SiteButtonColours } from "@/lib/storefront/site-buttons";
import type { SiteStyle } from "@/lib/storefront/site-style";

export type ChromeTarget = "header" | "announcement" | "footer" | null;

export type StudioSaveStatus = "idle" | "saving" | "saved" | "conflict" | "error";

export type CraftEditorChrome = {
  metadata: CraftSpikeMetadata;
  businessMode: BusinessMode;
  viewportWidth: number;
  setViewportWidth: (w: number) => void;
  addAtIndex: number | null;
  setAddAtIndex: (i: number | null) => void;
  previewUrl: string;
  isPublished: boolean;
  dirty: boolean;
  saveStatus: StudioSaveStatus;
  /** Seller-facing reason the last save or publish was refused. */
  saveError?: string | null;
  onSave: () => void;
  onPublish: () => void;
  pending: boolean;
  registryMode?: "craft" | "studio";
  templateId?: StudioTemplateId;
  templateClass?: string;
  templateStyle?: CSSProperties;
  paletteCollapsed?: boolean;
  setPaletteCollapsed?: (v: boolean) => void;
  commercePageKind?: CommercePageKind | null;
  surface?: "dashboard" | "storefront-preview";
  viewPreviewUrl?: string;
  /** Public address of the published site. */
  liveUrl?: string;
  chromeTarget?: ChromeTarget;
  setChromeTarget?: (t: ChromeTarget) => void;
  headerLayout?: HeaderLayout;
  brandMark?: BrandMarkMode;
  logoHeight?: number;
  /** Updates the logo size on screen without saving (during a drag). */
  previewLogoHeight?: (height: number) => void;
  setHeaderStyle?: (patch: {
    headerLayout?: HeaderLayout;
    brandMark?: BrandMarkMode;
    logoHeight?: number;
  }) => void;
  headerStyleStatus?: "idle" | "saving" | "saved" | "error";
  headerStyleError?: string | null;
  headerMenu?: HeaderMenu | null;
  /** Shows the change at once and saves it to the draft; null = automatic menu. */
  setHeaderMenu?: (menu: HeaderMenu | null) => void;
  headerMenuStatus?: "idle" | "saving" | "saved" | "error";
  headerMenuError?: string | null;
  announcementBar?: AnnouncementBar | null;
  setAnnouncementBar?: (bar: AnnouncementBar) => void;
  announcementBarStatus?: "idle" | "saving" | "saved" | "error";
  announcementBarError?: string | null;
  footer?: FooterSettings | null;
  /** Shows the change at once and saves it to the draft; null = automatic footer. */
  setFooter?: (footer: FooterSettings | null) => void;
  footerStatus?: "idle" | "saving" | "saved" | "error";
  footerError?: string | null;
  siteButtonColours?: SiteButtonColours;
  setSiteButtonColours?: (colours: SiteButtonColours) => void;
  siteButtonColoursStatus?: "idle" | "saving" | "saved" | "error";
  siteButtonColoursError?: string | null;
  siteLinkColour?: string | null;
  setSiteLinkColour?: (colour: string | null) => void;
  siteLinkColourStatus?: "idle" | "saving" | "saved" | "error";
  siteLinkColourError?: string | null;
  /** Header menu link text size in px; null = template default. */
  navTextSize?: number | null;
  setNavTextSize?: (size: number | null) => void;
  navTextSizeStatus?: "idle" | "saving" | "saved" | "error";
  navTextSizeError?: string | null;
  siteStyle?: SiteStyle;
  setSiteStyleField?: <K extends keyof SiteStyle>(key: K, value: SiteStyle[K] | undefined) => void;
  siteStyleStatus?: "idle" | "saving" | "saved" | "error";
  siteStyleError?: string | null;
  sitePageBackground?: string | null;
  setSitePageBackground?: (value: string | null) => void;
  sitePageBackgroundStatus?: "idle" | "saving" | "saved" | "error";
  sitePageBackgroundError?: string | null;
  pageOptions?: { value: string; label: string; href: string }[];
  currentPage?: string;
};

const CraftEditorContext = createContext<CraftEditorChrome | null>(null);

export function CraftEditorProvider({
  value,
  children,
}: {
  value: CraftEditorChrome;
  children: ReactNode;
}) {
  return (
    <CraftEditorContext.Provider value={value}>{children}</CraftEditorContext.Provider>
  );
}

export function useCraftEditorChrome(): CraftEditorChrome {
  const ctx = useContext(CraftEditorContext);
  if (!ctx) throw new Error("CraftEditorProvider required");
  return ctx;
}

export function useCraftMetadata(): CraftSpikeMetadata {
  return useCraftEditorChrome().metadata;
}
