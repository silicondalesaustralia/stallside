import Link from "next/link";
import { webStudioPath } from "@/lib/website/web-studio-nav";
import { ASSISTANT_PATH } from "@/lib/website/readiness";

type Props = {
  editorHref: string;
  flash?: { published?: boolean };
  /** Guided AI assistant replaces template and old AI builder links. */
  useAssistant?: boolean;
};

/** Layout and page content are edited on the storefront; this tab just opens the editor. */
export default function WebStudioLayoutPanel({ editorHref, flash, useAssistant }: Props) {
  return (
    <>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Edit your website
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Edit every page right on your site: drag sections, type straight onto the page, and switch
          pages from the menu at the top. Nothing goes live until you publish.
        </p>
      </div>
      {flash?.published ? <p className="text-sm font-medium text-[var(--ok)]">Website published.</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={editorHref}
          className="rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Open the editor
        </Link>
        {useAssistant ? (
          <Link href={ASSISTANT_PATH} className="text-sm font-semibold underline">
            Rebuild with AI
          </Link>
        ) : (
          <>
            <Link href="/dashboard/website/studio/templates" className="text-sm font-semibold underline">
              Change template
            </Link>
            <Link href={webStudioPath("ai")} className="text-sm font-semibold underline">
              AI builder
            </Link>
          </>
        )}
      </div>
      <p className="text-xs text-[var(--muted)]">
        Page settings, publishing and search &amp; social for pages, products, categories and posts are
        under Pages &amp; Posts in the dashboard.
      </p>
    </>
  );
}
