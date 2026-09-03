"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { Editor, Frame } from "@craftjs/core";
import type { SerializedNodes } from "@craftjs/core";
import { studioResolver } from "@/lib/studio/resolver";
import { buildStudioStarterTree } from "@/lib/studio/starter-composition";
import type { StudioMetadata, StudioTemplateId } from "@/lib/studio/types";
import { resolveStudioTemplate } from "@/lib/studio/templates";
import {
  publishWebsiteStudioDraft,
  saveWebsiteStudioDraft,
} from "@/app/dashboard/(gated)/website/studio/actions";
import {
  publishCustomPageDraft,
  saveCustomPageDraft,
} from "@/app/dashboard/(gated)/website/pages/actions";
import {
  publishCommerceLayoutDraft,
  saveCommerceLayoutDraft,
} from "@/app/dashboard/(gated)/website/commerce/actions";
import { buildCustomPageStarterTree } from "@/lib/studio/page-starters";
import { buildCommerceStarterTree } from "@/lib/studio/commerce-starters";
import type { CustomPageTemplateId } from "@/lib/studio/custom-pages";
import type { CommercePageKind } from "@/lib/studio/commerce-pages";
import StudioEditorShell from "@/components/studio/shell/StudioEditorShell";
import { StudioEditorProvider } from "./StudioEditorContext";
import StudioEditorHeader from "./StudioEditorHeader";
import StudioSectionPalette from "./StudioSectionPalette";
import StudioSettingsPanel from "./StudioSettingsPanel";
import StudioAddSectionModal from "./StudioAddSectionModal";
import StudioPageAddFooter from "./StudioPageAddFooter";

export default function StudioEditorInner({
  initialNodes,
  metadata,
  templateId,
  previewUrl,
  isPublished,
  starter,
  pageId,
  pageTitle,
  pageTemplate,
  commercePageKind,
}: {
  initialNodes: SerializedNodes | null;
  metadata: StudioMetadata;
  templateId: StudioTemplateId;
  previewUrl: string;
  isPublished: boolean;
  starter: {
    headline: string;
    subheadline: string | null;
    about: string | null;
    showNextDrop: boolean;
  };
  pageId?: string;
  pageTitle?: string;
  pageTemplate?: CustomPageTemplateId;
  commercePageKind?: CommercePageKind;
}) {
  const editorMetadata = useMemo(
    () => ({ ...metadata, templateId }),
    [metadata, templateId],
  );
  const template = resolveStudioTemplate(templateId, metadata.businessMode);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [addAtIndex, setAddAtIndex] = useState<number | null>(null);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [pending, startTransition] = useTransition();
  const serializedRef = useRef<string>("");

  const onSave = useCallback(() => {
    setSaveStatus("saving");
    startTransition(async () => {
      if (commercePageKind) {
        await saveCommerceLayoutDraft(commercePageKind, serializedRef.current);
      } else if (pageId) {
        await saveCustomPageDraft(pageId, serializedRef.current);
      } else {
        await saveWebsiteStudioDraft(serializedRef.current, templateId);
      }
      setDirty(false);
      setSaveStatus("saved");
    });
  }, [templateId, pageId, commercePageKind]);

  const onPublish = useCallback(() => {
    setSaveStatus("saving");
    startTransition(async () => {
      if (commercePageKind) {
        await publishCommerceLayoutDraft(commercePageKind, serializedRef.current);
      } else if (pageId) {
        await publishCustomPageDraft(pageId, serializedRef.current);
      } else {
        await publishWebsiteStudioDraft(serializedRef.current, templateId);
      }
      setDirty(false);
      setSaveStatus("saved");
    });
  }, [templateId, pageId, commercePageKind]);

  const chrome = useMemo(
    () => ({
      metadata: editorMetadata,
      businessMode: metadata.businessMode,
      viewportWidth,
      setViewportWidth,
      addAtIndex,
      setAddAtIndex,
      previewUrl,
      isPublished,
      dirty,
      saveStatus,
      onSave,
      onPublish,
      pending,
      registryMode: "studio" as const,
      templateId,
      templateClass: template.cssClass,
      templateStyle: template.style,
      paletteCollapsed,
      setPaletteCollapsed,
      commercePageKind: commercePageKind ?? null,
    }),
    [
      editorMetadata,
      metadata.businessMode,
      viewportWidth,
      addAtIndex,
      previewUrl,
      isPublished,
      dirty,
      saveStatus,
      onSave,
      onPublish,
      pending,
      templateId,
      template.cssClass,
      template.style,
      paletteCollapsed,
      commercePageKind,
    ],
  );

  const starterTree = commercePageKind
    ? buildCommerceStarterTree({
        kind: commercePageKind,
        templateId,
        headline: starter.headline,
      })
    : pageTemplate
      ? buildCustomPageStarterTree({
          template: pageTemplate,
          templateId,
          title: pageTitle ?? "Page",
          headline: starter.headline,
          about: starter.about,
        })
      : buildStudioStarterTree({
          templateId,
          ...starter,
        });

  return (
    <StudioEditorProvider value={chrome}>
      <div className="vendl-studio-editor overflow-hidden rounded-xl border border-[var(--line)] bg-[#f5f5f4]">
        <Editor
          resolver={studioResolver}
          indicator={{
            success: "rgb(23 54 31 / 0.35)",
            error: "#dc2626",
            thickness: 2,
          }}
          onNodesChange={(query) => {
            serializedRef.current = query.serialize();
            setDirty(true);
            setSaveStatus("idle");
          }}
        >
          <StudioEditorHeader />
          <div className="vendl-studio-editor__workspace">
            <StudioSectionPalette />
            <div className="vendl-studio-editor__canvas-wrap">
              <div
                className={`vendl-studio-editor__viewport ${template.cssClass}`}
                style={{ maxWidth: viewportWidth, ...template.style }}
              >
                <StudioEditorShell metadata={editorMetadata}>
                  <Frame data={initialNodes ?? undefined}>
                    {starterTree}
                  </Frame>
                  <StudioPageAddFooter />
                </StudioEditorShell>
              </div>
            </div>
            <StudioSettingsPanel />
          </div>
          <StudioAddSectionModal />
        </Editor>
      </div>
    </StudioEditorProvider>
  );
}
