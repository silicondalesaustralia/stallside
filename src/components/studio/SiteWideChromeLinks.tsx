"use client";

import { useStudioEditorChrome } from "./StudioEditorContext";
import type { ChromeTarget } from "@/components/craft/CraftEditorContext";

const PARTS: { target: Exclude<ChromeTarget, null>; label: string; hint: string }[] = [
  { target: "header", label: "Header & menu", hint: "Layout, logo, colours and menu links." },
  { target: "announcement", label: "Announcement bar", hint: "The message strip above the header." },
  { target: "footer", label: "Footer", hint: "Footer wording, links and colours." },
];

/** Header, announcement bar and footer are edited beside the page, so their changes show as you go. */
export default function SiteWideChromeLinks() {
  const { setChromeTarget, setSiteWideOpen } = useStudioEditorChrome();
  return (
    <div className="space-y-2">
      {PARTS.map((p) => (
        <button
          key={p.target}
          type="button"
          onClick={() => {
            setSiteWideOpen?.(false);
            setChromeTarget?.(p.target);
          }}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-4 py-3 text-left hover:bg-[var(--wash)]"
        >
          <span>
            <span className="block font-semibold text-[var(--field)]">{p.label}</span>
            <span className="block text-sm text-[var(--muted)]">{p.hint}</span>
          </span>
          <span aria-hidden className="text-[var(--muted)]">→</span>
        </button>
      ))}
      <p className="pt-1 text-xs text-[var(--muted)]">These open beside the page so you can see changes as you make them.</p>
    </div>
  );
}
