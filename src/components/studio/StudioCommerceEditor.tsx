"use client";

import dynamic from "next/dynamic";
import type { SerializedNodes } from "@craftjs/core";
import type { StudioMetadata, StudioTemplateId } from "@/lib/studio/types";
import type { CommercePageKind } from "@/lib/studio/commerce-pages";

const StudioEditorInner = dynamic(() => import("@/components/studio/StudioEditorInner"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--muted)]">
      Loading commerce editor…
    </div>
  ),
});

export default function StudioCommerceEditor({
  kind,
  initialNodes,
  metadata,
  templateId,
  previewUrl,
  isPublished,
  starter,
}: {
  kind: CommercePageKind;
  initialNodes: SerializedNodes | null;
  metadata: StudioMetadata;
  templateId: StudioTemplateId;
  previewUrl: string;
  isPublished: boolean;
  starter: {
    headline: string;
    subheadline: string | null;
    about: string | null;
  };
}) {
  return (
    <StudioEditorInner
      initialNodes={initialNodes}
      metadata={metadata}
      templateId={templateId}
      previewUrl={previewUrl}
      isPublished={isPublished}
      starter={{ ...starter, showNextDrop: false }}
      commercePageKind={kind}
    />
  );
}
