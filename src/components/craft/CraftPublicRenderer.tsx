"use client";

import { Editor, Frame } from "@craftjs/core";
import type { SerializedNodes } from "@craftjs/core";
import { craftSpikeResolver } from "@/lib/craft/resolver";
import type { CraftSpikeMetadata } from "@/lib/craft/types";
import { CraftEditorProvider } from "./CraftEditorContext";

export default function CraftPublicRenderer({
  nodes,
  metadata,
}: {
  nodes: SerializedNodes;
  metadata: CraftSpikeMetadata;
}) {
  const chrome = {
    metadata,
    businessMode: metadata.businessMode,
    viewportWidth: 1280,
    setViewportWidth: () => {},
    addAtIndex: null,
    setAddAtIndex: () => {},
    previewUrl: "",
    isPublished: true,
    dirty: false,
    saveStatus: "idle" as const,
    onSave: () => {},
    onPublish: () => {},
    pending: false,
  };

  return (
    <CraftEditorProvider value={chrome}>
      <Editor enabled={false} resolver={craftSpikeResolver}>
        <Frame data={nodes} />
      </Editor>
    </CraftEditorProvider>
  );
}
