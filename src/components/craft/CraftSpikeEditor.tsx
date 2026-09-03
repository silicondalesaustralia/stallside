"use client";

import dynamic from "next/dynamic";
import type { SerializedNodes } from "@craftjs/core";
import type { CraftSpikeMetadata } from "@/lib/craft/types";

const CraftEditorInner = dynamic(() => import("./CraftEditorInner"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--muted)]">
      Loading website editor…
    </div>
  ),
});

export default function CraftSpikeEditor({
  initialNodes,
  metadata,
  previewUrl,
  isPublished,
  starter,
  saved,
  published,
  error,
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
  saved?: boolean;
  published?: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {saved ? <p className="text-sm font-medium text-[var(--ok)]">Draft saved.</p> : null}
      {published ? <p className="text-sm font-medium text-[var(--ok)]">Published.</p> : null}
      {error ? <p className="text-sm font-medium text-[var(--gone)]">Could not save — please try again.</p> : null}
      <CraftEditorInner
        initialNodes={initialNodes}
        metadata={metadata}
        previewUrl={previewUrl}
        isPublished={isPublished}
        starter={starter}
      />
    </div>
  );
}
