"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Editor, Frame } from "@craftjs/core";
import type { SerializedNodes } from "@craftjs/core";
import { studioResolver } from "@/lib/studio/resolver";
import { buildStudioStarterTree } from "@/lib/studio/starter-composition";
import type { StudioMetadata, StudioTemplateId } from "@/lib/studio/types";
import { resolveStudioTemplate } from "@/lib/studio/templates";
import {
  publishWebsiteStudioDraft,
  saveWebsiteStudioDraft,
  saveStorefrontHeaderStyle,
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
import type { BrandMarkMode, HeaderLayout } from "@/lib/storefront/header-style";
import type { ChromeTarget, StudioSaveStatus } from "@/components/craft/CraftEditorContext";
import type { EditorSaveResult } from "@/lib/website/persistence/editor-result";
import StudioEditorShell from "@/components/studio/shell/StudioEditorShell";
import { StudioEditorProvider } from "./StudioEditorContext";
import StudioEditorHeader from "./StudioEditorHeader";
import StudioSaveNotice from "./StudioSaveNotice";
import StudioSectionPalette from "./StudioSectionPalette";
import StudioSettingsPanel from "./StudioSettingsPanel";
import StudioAddSectionModal from "./StudioAddSectionModal";
import StudioPageAddFooter from "./StudioPageAddFooter";

export default function StudioEditorInner({
  initialNodes,
  metadata,
  templateId,
  previewUrl,
  viewPreviewUrl,
  isPublished,
  starter,
  pageId,
  pageTitle,
  pageTemplate,
  commercePageKind,
  returnTo,
  surface = "dashboard",
}: {
  initialNodes: SerializedNodes | null;
  metadata: StudioMetadata;
  templateId: StudioTemplateId;
  previewUrl: string;
  viewPreviewUrl?: string;
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
  returnTo?: string;
  surface?: "dashboard" | "storefront-preview";
}) {
  const editorMetadata = useMemo(
    () => ({ ...metadata, templateId }),
    [metadata, templateId],
  );
  const template = resolveStudioTemplate(templateId, metadata.businessMode);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [addAtIndex, setAddAtIndex] = useState<number | null>(null);
  const [paletteCollapsed, setPaletteCollapsed] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<StudioSaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const serializedRef = useRef<string>("");
  const revisionRef = useRef(metadata.draftRevision);
  useEffect(() => {
    revisionRef.current = metadata.draftRevision;
  }, [metadata.draftRevision]);
  const [chromeTarget, setChromeTarget] = useState<ChromeTarget>(null);
  const [headerLayout, setHeaderLayout] = useState<HeaderLayout>(
    metadata.resolvedBranding.headerLayout,
  );
  const [brandMark, setBrandMark] = useState<BrandMarkMode>(
    metadata.resolvedBranding.brandMark,
  );
  const [headerStyleStatus, setHeaderStyleStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const setHeaderStyle = useCallback(
    (patch: { headerLayout?: HeaderLayout; brandMark?: BrandMarkMode }) => {
      if (patch.headerLayout) setHeaderLayout(patch.headerLayout);
      if (patch.brandMark) setBrandMark(patch.brandMark);
      setHeaderStyleStatus("saving");
      startTransition(async () => {
        try {
          const result = await saveStorefrontHeaderStyle({
            ...patch,
            expectedRevision: revisionRef.current,
          });
          if (result.ok) revisionRef.current = result.revision;
          setHeaderStyleStatus(result.ok ? "saved" : "error");
        } catch {
          setHeaderStyleStatus("error");
        }
      });
    },
    [],
  );

  const runSave = useCallback(
    (mode: "save" | "publish") => {
      setSaveStatus("saving");
      setSaveError(null);
      startTransition(async () => {
        try {
          const nodes = serializedRef.current;
          const revision = revisionRef.current;
          const publish = mode === "publish";
          const result: EditorSaveResult | undefined = commercePageKind
            ? await (publish ? publishCommerceLayoutDraft : saveCommerceLayoutDraft)(
                commercePageKind,
                nodes,
                revision,
              )
            : pageId
              ? await (publish ? publishCustomPageDraft : saveCustomPageDraft)(pageId, nodes, revision)
              : await (publish ? publishWebsiteStudioDraft : saveWebsiteStudioDraft)(
                  nodes,
                  templateId,
                  revision,
                  returnTo,
                );
          // Successful saves redirect, so the action resolves without a result.
          if (!result) {
            setDirty(false);
            setSaveStatus("saved");
            return;
          }
          setSaveStatus(result.error === "conflict" ? "conflict" : "error");
          setSaveError(result.message);
        } catch {
          setSaveStatus("error");
          setSaveError("Could not save. Check your connection and try again.");
        }
      });
    },
    [templateId, pageId, commercePageKind, returnTo],
  );
  const onSave = useCallback(() => runSave("save"), [runSave]);
  const onPublish = useCallback(() => runSave("publish"), [runSave]);

  const chrome = useMemo(
    () => ({
      metadata: editorMetadata,
      businessMode: metadata.businessMode,
      viewportWidth,
      setViewportWidth,
      addAtIndex,
      setAddAtIndex,
      previewUrl,
      viewPreviewUrl,
      isPublished,
      dirty,
      saveStatus,
      saveError,
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
      surface,
      chromeTarget,
      setChromeTarget,
      headerLayout,
      brandMark,
      setHeaderStyle,
      headerStyleStatus,
    }),
    [
      editorMetadata,
      metadata.businessMode,
      viewportWidth,
      addAtIndex,
      previewUrl,
      viewPreviewUrl,
      isPublished,
      dirty,
      saveStatus,
      saveError,
      onSave,
      onPublish,
      pending,
      templateId,
      template.cssClass,
      template.style,
      paletteCollapsed,
      commercePageKind,
      surface,
      chromeTarget,
      headerLayout,
      brandMark,
      setHeaderStyle,
      headerStyleStatus,
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
      <div
        className={`vendl-studio-editor vendl-studio-editor--preview-first bg-[#f5f5f4] ${
          surface === "storefront-preview"
            ? "min-h-screen border-0"
            : "overflow-hidden rounded-xl border border-[var(--line)]"
        }`}
      >
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
          <StudioSaveNotice />
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
