"use client";

import dynamic from "next/dynamic";
import type { Data } from "@puckeditor/core";
import type { PuckSpikeMetadata } from "@/lib/puck/types";

const PuckSpikeEditorInner = dynamic(() => import("./PuckSpikeEditorInner"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--muted)]">
      Loading website editor…
    </div>
  ),
});

export default function PuckSpikeEditor({
  initialData,
  metadata,
  previewUrl,
  isPublished,
  saved,
  published,
  error,
  onResetDraft,
}: {
  initialData: Data;
  metadata: PuckSpikeMetadata;
  previewUrl: string;
  isPublished: boolean;
  saved?: boolean;
  published?: boolean;
  error?: string;
  onResetDraft?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {saved ? (
        <p className="text-sm font-medium text-[var(--ok)]">Draft saved.</p>
      ) : null}
      {published ? (
        <p className="text-sm font-medium text-[var(--ok)]">Published.</p>
      ) : null}
      {error ? (
        <p className="text-sm font-medium text-[var(--gone)]">
          Could not save — please try again.
        </p>
      ) : null}
      {process.env.NODE_ENV === "development" && onResetDraft ? (
        <form action={onResetDraft}>
          <button
            type="submit"
            className="text-xs text-[var(--muted)] underline hover:text-[var(--field)]"
          >
            Reset draft to starter layout (dev only)
          </button>
        </form>
      ) : null}
      <PuckSpikeEditorInner
        initialData={initialData}
        metadata={metadata}
        previewUrl={previewUrl}
        isPublished={isPublished}
      />
    </div>
  );
}
