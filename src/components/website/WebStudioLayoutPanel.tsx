import Link from "next/link";
import StudioEditor from "@/components/studio/StudioEditor";
import type { SerializedNodes } from "@craftjs/core";
import type { StudioMetadata, StudioTemplateId } from "@/lib/studio/types";
import { webStudioPath } from "@/lib/website/web-studio-nav";

type Props = {
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
  flash?: { saved?: boolean; published?: boolean; error?: string };
};

export default function WebStudioLayoutPanel({
  initialNodes,
  metadata,
  templateId,
  previewUrl,
  isPublished,
  starter,
  flash,
}: Props) {
  return (
    <>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Edit layout
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Drag sections onto your homepage, edit in place, then publish when ready.
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          <Link href="/dashboard/website/studio/templates" className="underline">
            Change template
          </Link>
          {" · "}
          <Link href={webStudioPath("ai")} className="underline">
            AI builder
          </Link>
        </p>
      </div>
      <StudioEditor
        initialNodes={initialNodes}
        metadata={metadata}
        templateId={templateId}
        previewUrl={previewUrl}
        isPublished={isPublished}
        starter={starter}
        saved={flash?.saved}
        published={flash?.published}
        error={flash?.error}
      />
    </>
  );
}
