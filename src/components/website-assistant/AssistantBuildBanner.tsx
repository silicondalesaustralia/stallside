import Link from "next/link";
import { ASSISTANT_PATH } from "@/lib/website/readiness";
import type { LatestBuild } from "@/lib/website-ai/assistant/jobs/latest-build";

type Props = { state: Exclude<LatestBuild, null>; previewPath: string; editorHref: string };

const COPY = {
  building: { text: "Your website is being built…", action: "See progress", tone: "border-[var(--line)] bg-[var(--surface)]" },
  confirm: { text: "Your new website is ready, but your draft changed meanwhile.", action: "Review and confirm", tone: "border-amber-200 bg-amber-50 text-amber-900" },
  ready: { text: "Your new website is ready.", action: null, tone: "border-green-200 bg-green-50 text-green-900" },
  failed: { text: "Your last build didn't finish.", action: "Try again", tone: "border-red-200 bg-red-50 text-red-900" },
} as const;

/** Shows a running or recently finished AI build on the Create with AI tab. */
export default function AssistantBuildBanner({ state, previewPath, editorHref }: Props) {
  const c = COPY[state];
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-md border px-4 py-3 text-sm ${c.tone}`}>
      <p className="font-medium">{c.text}</p>
      {c.action ? (
        <Link href={ASSISTANT_PATH} className="font-semibold underline">
          {c.action}
        </Link>
      ) : (
        <>
          <a href={previewPath} target="_blank" rel="noreferrer" className="font-semibold underline">
            Preview it
          </a>
          <Link href={editorHref} className="font-semibold underline">
            Edit in the editor
          </Link>
        </>
      )}
    </div>
  );
}
