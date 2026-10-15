"use client";

import { useState, useTransition } from "react";
import { markPolicyReviewedAction } from "@/app/dashboard/(gated)/website/assistant/build-actions";

const LABELS: Record<string, string> = {
  "builtin-privacy": "Privacy policy",
  "builtin-terms": "Terms of service",
  "builtin-returns": "Returns & refunds",
  "builtin-shipping": "Shipping & pickup",
};

type Props = { pageIds: string[] };

export default function PolicyReviewList({ pageIds }: Props) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (pageIds.length === 0) return null;

  const review = (pageId: string) =>
    start(async () => {
      setError(null);
      const res = await markPolicyReviewedAction(pageId);
      if (res.ok) setDone((prev) => new Set(prev).add(pageId));
      else setError(res.error);
    });

  return (
    <section className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">Review required before publishing</p>
      <p className="mt-1 text-xs">
        These policies were drafted by AI from your details. Read each one in the preview or editor, fix anything that&apos;s
        wrong, then tick it. This isn&apos;t legal advice.
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {pageIds.map((id) => (
          <li key={id}>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={done.has(id)} disabled={done.has(id) || pending} onChange={() => review(id)} />
              I&apos;ve reviewed the {LABELS[id] ?? "policy"} page
            </label>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-2 text-red-700">{error}</p> : null}
    </section>
  );
}
