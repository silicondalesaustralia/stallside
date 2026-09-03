"use client";

import dynamic from "next/dynamic";
import type { SerializedNodes } from "@craftjs/core";
import type { StudioMetadata, StudioTemplateId } from "@/lib/studio/types";

const StudioEditorInner = dynamic(() => import("./StudioEditorInner"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--muted)]">
      Loading website studio…
    </div>
  ),
});

export default function StudioEditor({
  initialNodes,
  metadata,
  templateId,
  previewUrl,
  isPublished,
  starter,
  saved,
  published,
  error,
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
  saved?: boolean;
  published?: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {saved ? <p className="text-sm font-medium text-[var(--ok)]">Draft saved.</p> : null}
      {published ? <p className="text-sm font-medium text-[var(--ok)]">Published.</p> : null}
      {error ? <p className="text-sm font-medium text-[var(--gone)]">Could not save — please try again.</p> : null}
      <StudioEditorInner
        initialNodes={initialNodes}
        metadata={metadata}
        templateId={templateId}
        previewUrl={previewUrl}
        isPublished={isPublished}
        starter={starter}
      />
    </div>
  );
}
