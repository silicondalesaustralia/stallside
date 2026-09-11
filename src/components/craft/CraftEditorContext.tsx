"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import type { CraftSpikeMetadata } from "@/lib/craft/types";
import type { BusinessMode } from "@/lib/business-mode";
import type { StudioTemplateId } from "@/lib/studio/types";
import type { CommercePageKind } from "@/lib/studio/commerce-pages";
import type { BrandMarkMode, HeaderLayout } from "@/lib/storefront/header-style";

export type ChromeTarget = "header" | null;

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
  saveStatus: "idle" | "saving" | "saved";
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
  chromeTarget?: ChromeTarget;
  setChromeTarget?: (t: ChromeTarget) => void;
  headerLayout?: HeaderLayout;
  brandMark?: BrandMarkMode;
  setHeaderStyle?: (patch: {
    headerLayout?: HeaderLayout;
    brandMark?: BrandMarkMode;
  }) => void;
  headerStyleStatus?: "idle" | "saving" | "saved" | "error";
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
