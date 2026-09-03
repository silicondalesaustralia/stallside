"use client";

import { usePuck } from "@puckeditor/core";
import type { ReactNode } from "react";
import StorefrontEditorShell from "./StorefrontEditorShell";
import type { PuckSpikeMetadata } from "@/lib/puck/types";

export default function VendlEditorPreview({
  children,
  metadata,
}: {
  children: ReactNode;
  metadata: PuckSpikeMetadata;
}) {
  const { appState } = usePuck();
  const width = appState.ui.viewports.current.width;
  const numericWidth = typeof width === "number" ? width : 1280;

  return (
    <div className="vendl-editor-preview-outer">
      <div
        className="vendl-editor-preview-frame"
        style={{ maxWidth: numericWidth }}
      >
        <StorefrontEditorShell
          branding={metadata.resolvedBranding}
          storefrontSlug={metadata.storefrontSlug}
          standSlug={metadata.standSlug}
          basePath={metadata.basePath}
          enabledPages={metadata.enabledPages}
        >
          {children}
        </StorefrontEditorShell>
      </div>
    </div>
  );
}
