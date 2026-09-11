import Link from "next/link";
import AiBuilderForm from "@/components/website-ai/AiBuilderForm";
import { publishAiWebsiteDraft } from "@/app/dashboard/(gated)/website/ai/actions";
import type { WebsiteContextAssessment } from "@/lib/website-ai/assess-context";
import type { BrandLookCombo } from "@/lib/website/brand-looks";
import { webStudioPath } from "@/lib/website/web-studio-nav";

type Props = {
  enabled: boolean;
  allowed: boolean;
  assessment?: WebsiteContextAssessment;
  previewPath?: string;
  initialLooks?: BrandLookCombo[];
  draftTemplateId?: string | null;
  publishedFlash?: boolean;
  businessName?: string;
  logoUrl?: string | null;
};

export default function WebStudioAiPanel({
  enabled,
  allowed,
  assessment,
  previewPath,
  initialLooks = [],
  draftTemplateId,
  publishedFlash,
  businessName,
  logoUrl,
}: Props) {
  if (!enabled) {
    return (
      <>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          AI builder
        </h1>
        <p className="text-sm text-[var(--muted)]">
          This beta path is turned off in this environment.
        </p>
        <p className="text-sm text-[var(--muted)]">Use the Edit layout tab instead.</p>
      </>
    );
  }

  if (!allowed) {
    return (
      <>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          AI builder
        </h1>
        <p className="text-sm text-[var(--muted)]">
          You&apos;re in the classic Studio cohort for this A/B test.
        </p>
        <p className="text-sm text-[var(--muted)]">Use the Edit layout tab instead.</p>
      </>
    );
  }

  return (
    <>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          AI builder
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Build a scaffold, choose a starting style, pick a colour palette, then generate your draft.
        </p>
      </div>

      {publishedFlash ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          Website published.
        </p>
      ) : null}

      {draftTemplateId && previewPath ? (
        <div className="rounded-md border border-[var(--border)] px-4 py-3 text-sm">
          <p className="font-medium text-[var(--field)]">Draft already exists</p>
          <p className="mt-1 text-[var(--muted)]">
            Generating again will replace the homepage draft (not the live site until you
            publish). Template: {draftTemplateId}.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <a
              href={previewPath}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--field)] underline"
            >
              Preview website
            </a>
            <Link href={webStudioPath("studio")} className="underline text-[var(--muted)]">
              Edit layout
            </Link>
            <form action={publishAiWebsiteDraft}>
              <button type="submit" className="underline text-[var(--muted)]">
                Publish draft
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {assessment && previewPath ? (
        <AiBuilderForm
          assessment={assessment}
          previewPath={previewPath}
          initialLooks={initialLooks}
          businessName={businessName}
          logoUrl={logoUrl}
        />
      ) : null}
    </>
  );
}
