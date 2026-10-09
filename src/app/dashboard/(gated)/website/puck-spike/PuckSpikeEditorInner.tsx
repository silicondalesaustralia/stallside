"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import type { Data } from "@puckeditor/core";
import { puckSpikeConfig } from "@/lib/puck/spike-config";
import type { PuckSpikeMetadata } from "@/lib/puck/types";
import { savePuckSpikeDraft, publishPuckSpikeDraft } from "./actions";
import { EditorChromeProvider } from "@/components/puck/editor/EditorChromeContext";
import VendlEditorHeader from "@/components/puck/editor/VendlEditorHeader";
import VendlSectionOverlay, {
  VendlActionBarOverride,
} from "@/components/puck/editor/VendlSectionOverlay";
import VendlAddSectionModal, {
  VendlSectionsPanel,
} from "@/components/puck/editor/VendlAddSectionModal";
import VendlSidebarSync from "@/components/puck/editor/VendlSidebarSync";
import VendlEditorPreview from "@/components/puck/editor/VendlEditorPreview";
import VendlSettingsOverlay from "@/components/puck/editor/VendlSettingsOverlay";
import VendlEditorOnboarding from "@/components/puck/editor/VendlEditorOnboarding";

const VIEWPORTS = [
  { width: 375, height: "auto" as const, label: "Mobile", icon: "Smartphone" as const },
  { width: 768, height: "auto" as const, label: "Tablet", icon: "Tablet" as const },
  { width: 1280, height: "auto" as const, label: "Desktop", icon: "Monitor" as const },
];

export default function PuckSpikeEditorInner({
  initialData,
  metadata,
  previewUrl,
  isPublished,
}: {
  initialData: Data;
  metadata: PuckSpikeMetadata;
  previewUrl: string;
  isPublished: boolean;
}) {
  const [data, setData] = useState<Data>(initialData);
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [addAtIndex, setAddAtIndex] = useState<number | null>(null);
  const [showSectionsPanel, setShowSectionsPanel] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSave = useCallback(() => {
    setSaveStatus("saving");
    startTransition(async () => {
      await savePuckSpikeDraft(JSON.stringify(data));
      setDirty(false);
      setSaveStatus("saved");
    });
  }, [data]);

  const onPublish = useCallback(() => {
    setSaveStatus("saving");
    startTransition(async () => {
      await publishPuckSpikeDraft(JSON.stringify(data));
      setDirty(false);
      setSaveStatus("saved");
    });
  }, [data]);

  const chrome = useMemo(
    () => ({
      addAtIndex,
      setAddAtIndex,
      showSectionsPanel,
      setShowSectionsPanel,
      previewUrl,
      isPublished,
      pending,
      dirty,
      saveStatus,
      onSave,
      onPublish,
      metadata,
      businessMode: metadata.businessMode,
    }),
    [
      addAtIndex,
      showSectionsPanel,
      previewUrl,
      isPublished,
      pending,
      dirty,
      saveStatus,
      onSave,
      onPublish,
      metadata,
    ],
  );

  const overrides = useMemo(
    () => ({
      header: () => <VendlEditorHeader />,
      headerActions: () => <></>,
      drawer: () => <></>,
      outline: () => <></>,
      fields: () => <></>,
      componentOverlay: VendlSectionOverlay,
      actionBar: VendlActionBarOverride,
      preview: ({ children }: { children: React.ReactNode }) => (
        <VendlEditorPreview metadata={metadata}>{children}</VendlEditorPreview>
      ),
      puck: ({ children }: { children: React.ReactNode }) => (
        <>
          <VendlSidebarSync />
          {children}
          <VendlAddSectionModal />
          <VendlSectionsPanel />
          <VendlSettingsOverlay />
          <VendlEditorOnboarding />
        </>
      ),
    }),
    [metadata],
  );

  return (
    <EditorChromeProvider value={chrome}>
      <div className="vendl-website-editor overflow-hidden rounded-xl border border-[var(--line)] bg-[#f5f5f4]">
        <Puck
          config={puckSpikeConfig}
          data={data}
          onChange={(next) => {
            setData(next);
            setDirty(true);
            setSaveStatus("idle");
          }}
          metadata={metadata}
          viewports={VIEWPORTS}
          iframe={{ enabled: false }}
          ui={{
            leftSideBarVisible: false,
            rightSideBarVisible: false,
            viewports: {
              controlsVisible: false,
              current: { width: 1280, height: "auto" },
              options: VIEWPORTS,
            },
          }}
          overrides={overrides}
        />
      </div>
    </EditorChromeProvider>
  );
}
