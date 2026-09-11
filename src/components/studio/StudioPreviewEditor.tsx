"use client";

import dynamic from "next/dynamic";
import type { SerializedNodes } from "@craftjs/core";
import type { StudioMetadata, StudioTemplateId } from "@/lib/studio/types";

const StudioEditorInner = dynamic(() => import("./StudioEditorInner"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center bg-[var(--wash)] text-sm text-[var(--muted)]">
      Loading editor…
    </div>
  ),
});

/** Full Craft editor mounted on the public studio-preview route (owner + edit=1). */
export default function StudioPreviewEditor({
  initialNodes,
  metadata,
  templateId,
  previewUrl,
  viewPreviewUrl,
  isPublished,
  starter,
  returnTo,
  saved,
  published,
  error,
}: {
  initialNodes: SerializedNodes | null;
  metadata: StudioMetadata;
  templateId: StudioTemplateId;
  previewUrl: string;
  viewPreviewUrl: string;
  isPublished: boolean;
  starter: {
    headline: string;
    subheadline: string | null;
    about: string | null;
    showNextDrop: boolean;
  };
  returnTo: string;
  saved?: boolean;
  published?: boolean;
  error?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      {saved ? (
        <p className="border-b border-green-200 bg-green-50 px-4 py-2 text-center text-sm text-green-900">
          Draft saved.
        </p>
      ) : null}
      {published ? (
        <p className="border-b border-green-200 bg-green-50 px-4 py-2 text-center text-sm text-green-900">
          Published.
        </p>
      ) : null}
      {error ? (
        <p className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-800">
          Could not save — please try again.
        </p>
      ) : null}
      <StudioEditorInner
        initialNodes={initialNodes}
        metadata={metadata}
        templateId={templateId}
        previewUrl={previewUrl}
        viewPreviewUrl={viewPreviewUrl}
        isPublished={isPublished}
        starter={starter}
        returnTo={returnTo}
        surface="storefront-preview"
      />
    </div>
  );
}
