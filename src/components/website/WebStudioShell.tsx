"use client";

import { useState, type ReactNode } from "react";
import {
  WEB_STUDIO_TABS,
  type WebStudioTabId,
  webStudioPath,
} from "@/lib/website/web-studio-nav";

type Props = {
  initialTab: WebStudioTabId;
  details: ReactNode;
  branding: ReactNode;
  ai: ReactNode;
  studio: ReactNode;
};

/** Client tabs so Web Studio steps switch without a full navigation. */
export default function WebStudioShell({
  initialTab,
  details,
  branding,
  ai,
  studio,
}: Props) {
  const [tab, setTab] = useState<WebStudioTabId>(initialTab);
  const [visited, setVisited] = useState<Set<WebStudioTabId>>(
    () => new Set([initialTab]),
  );

  function selectTab(next: WebStudioTabId) {
    setTab(next);
    setVisited((prev) => {
      if (prev.has(next)) return prev;
      const copy = new Set(prev);
      copy.add(next);
      return copy;
    });
    window.history.replaceState(null, "", webStudioPath(next));
  }

  const panels: Record<WebStudioTabId, ReactNode> = {
    details,
    branding,
    ai,
    studio,
  };

  return (
    <div
      className={`flex flex-col gap-6 pb-12 ${
        tab === "studio" ? "" : "mx-auto max-w-2xl"
      }`}
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Web Studio
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          First add your business details, then your branding. Our AI builder uses
          those to draft your site — then preview, edit the layout, and publish when
          you&apos;re ready.
        </p>
        <nav
          aria-label="Web Studio steps"
          className="flex gap-1 overflow-x-auto border-b border-[var(--line)] pb-px"
        >
          {WEB_STUDIO_TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-t-lg px-3 py-2 text-sm font-semibold ${
                  active
                    ? "border border-b-0 border-[var(--line)] bg-white text-[var(--field)]"
                    : "text-[var(--muted)] hover:text-[var(--field)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {WEB_STUDIO_TABS.map((item) => {
        if (!visited.has(item.id)) return null;
        return (
          <div
            key={item.id}
            hidden={tab !== item.id}
            className={tab === item.id ? "flex flex-col gap-6" : undefined}
          >
            {panels[item.id]}
          </div>
        );
      })}
    </div>
  );
}
