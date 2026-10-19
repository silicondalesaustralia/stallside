"use client";

import { useMemo, useState } from "react";
import BlogBodyEditor from "@/components/blog/BlogBodyEditor";
import BlogDiffView from "@/components/blog/BlogDiffView";
import BlogFaqFields from "@/components/blog/BlogFaqFields";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { countDiffChanges, diffHtmlBlocks } from "@/lib/blog/html-diff";
import type { BlogFaq } from "@/lib/blog/types";
import { publishRevisionAction } from "../../revision-actions";
import RevisionSeoFields, { type RevisionSeo } from "./RevisionSeoFields";

type Props = {
  revisionId: string;
  baseHtml: string;
  proposedHtml: string;
  base: RevisionSeo;
  proposed: RevisionSeo;
  faqs: BlogFaq[];
  stale: boolean;
};

export default function RevisionReviewForm(props: Props) {
  const [html, setHtml] = useState(props.proposedHtml);
  const [view, setView] = useState<"changes" | "edit">("changes");
  const parts = useMemo(() => diffHtmlBlocks(props.baseHtml, html), [props.baseHtml, html]);
  const { added, removed } = countDiffChanges(parts);

  const tabClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-semibold ${
      active ? "bg-[var(--field)] text-[var(--ink-on-dark)]" : "bg-white ring-1 ring-[var(--line)]"
    }`;

  return (
    <form action={publishRevisionAction} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <input type="hidden" name="revisionId" value={props.revisionId} />
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setView("changes")} className={tabClass(view === "changes")}>
            Highlighted changes
          </button>
          <button type="button" onClick={() => setView("edit")} className={tabClass(view === "edit")}>
            Edit proposed version
          </button>
          <span className="text-sm">
            <span className="font-semibold text-green-800">+{added}</span>
            {" / "}
            <span className="font-semibold text-red-800">−{removed}</span> blocks
          </span>
        </div>
        <div className={view === "changes" ? "dash-card p-5" : "hidden"}>
          <BlogDiffView parts={parts} />
        </div>
        <div className={view === "edit" ? "" : "hidden"}>
          <BlogBodyEditor name="bodyHtml" defaultValue={props.proposedHtml} onChange={setHtml} />
        </div>
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">FAQs after this update</h2>
          <BlogFaqFields name="faqsJson" defaultValue={props.faqs} />
        </section>
      </div>

      <div className="flex flex-col gap-4">
        <section className="dash-card flex flex-col gap-3 p-4">
          {props.stale ? (
            <label className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              <input type="checkbox" name="confirmStale" value="1" className="mt-1" />
              The live post was edited after this update was drafted. Publishing will overwrite those edits.
            </label>
          ) : null}
          <button type="submit" className={dashCtaClass}>
            Publish update
          </button>
          <p className="text-xs text-[var(--muted)]">
            Highlights are for review only and never appear on the live page.
          </p>
        </section>
        <RevisionSeoFields base={props.base} proposed={props.proposed} />
      </div>
    </form>
  );
}
