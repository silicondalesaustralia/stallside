"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { Editor, Frame } from "@craftjs/core";
import type { SerializedNodes } from "@craftjs/core";
import { craftSpikeResolver } from "@/lib/craft/resolver";
import type { CraftSpikeMetadata } from "@/lib/craft/types";
import { saveCraftSpikeDraft, publishCraftSpikeDraft } from "@/app/dashboard/(gated)/website/craft-spike/actions";
import StorefrontEditorShell from "@/components/puck/editor/StorefrontEditorShell";
import { CraftEditorProvider } from "./CraftEditorContext";
import CraftEditorHeader from "./CraftEditorHeader";
import CraftSettingsDrawer from "./CraftSettingsDrawer";
import CraftAddSectionModal, { CraftPageAddFooter } from "./CraftAddSectionModal";
import { CraftStarterTree } from "./sections/CraftPageRoot";

export default function CraftEditorInner({
  initialNodes,
  metadata,
  previewUrl,
  isPublished,
  starter,
}: {
  initialNodes: SerializedNodes | null;
  metadata: CraftSpikeMetadata;
  previewUrl: string;
  isPublished: boolean;
  starter: {
    headline: string;
    subheadline: string | null;
    about: string | null;
    showNextDrop: boolean;
  };
}) {
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [addAtIndex, setAddAtIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [pending, startTransition] = useTransition();
  const serializedRef = useRef<string>("");

  const onSave = useCallback(() => {
    setSaveStatus("saving");
    startTransition(async () => {
      await saveCraftSpikeDraft(serializedRef.current);
      setDirty(false);
      setSaveStatus("saved");
    });
  }, []);

  const onPublish = useCallback(() => {
    setSaveStatus("saving");
    startTransition(async () => {
      await publishCraftSpikeDraft(serializedRef.current);
      setDirty(false);
      setSaveStatus("saved");
    });
  }, []);

  const chrome = useMemo(
    () => ({
      metadata,
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
    }),
    [
      metadata,
      viewportWidth,
      addAtIndex,
      previewUrl,
      isPublished,
      dirty,
      saveStatus,
      onSave,
      onPublish,
      pending,
    ],
  );

  return (
    <CraftEditorProvider value={chrome}>
      <div className="vendl-craft-editor overflow-hidden rounded-xl border border-[var(--line)] bg-[#f5f5f4]">
        <Editor
          resolver={craftSpikeResolver}
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
          <CraftEditorHeader />
          <div className="vendl-craft-editor__canvas-wrap">
            <div
              className="vendl-craft-editor__viewport"
              style={{ maxWidth: viewportWidth }}
            >
              <StorefrontEditorShell
                branding={metadata.resolvedBranding}
                storefrontSlug={metadata.storefrontSlug}
                standSlug={metadata.standSlug}
                basePath={metadata.basePath}
                enabledPages={metadata.enabledPages}
              >
                <Frame data={initialNodes ?? undefined}>
                  <CraftStarterTree
                    headline={starter.headline}
                    subheadline={starter.subheadline}
                    about={starter.about}
                    showNextDrop={starter.showNextDrop}
                  />
                </Frame>
                <CraftPageAddFooter />
              </StorefrontEditorShell>
            </div>
          </div>
          <CraftSettingsDrawer />
          <CraftAddSectionModal />
        </Editor>
      </div>
    </CraftEditorProvider>
  );
}
