"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import type { CraftSpikeMetadata } from "@/lib/craft/types";
import type { BusinessMode } from "@/lib/business-mode";
import type { StudioTemplateId } from "@/lib/studio/types";
import type { CommercePageKind } from "@/lib/studio/commerce-pages";

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
  /** Studio editor uses expanded section registry + right panel */
  registryMode?: "craft" | "studio";
  templateId?: StudioTemplateId;
  templateClass?: string;
  templateStyle?: CSSProperties;
  paletteCollapsed?: boolean;
  setPaletteCollapsed?: (v: boolean) => void;
  commercePageKind?: CommercePageKind | null;
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
