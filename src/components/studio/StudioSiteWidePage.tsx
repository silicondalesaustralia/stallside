"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useEditor } from "@craftjs/core";
import { useStudioEditorChrome } from "./StudioEditorContext";
import SiteTypographySettings from "./SiteTypographySettings";
import SiteLayoutSettings from "./SiteLayoutSettings";
import SiteCardsEffectsSettings from "./SiteCardsEffectsSettings";
import SiteStyleSaveStatus from "./SiteStyleSaveStatus";
import PageStyleSettings from "./PageStyleSettings";
import SiteButtonSettings from "./SiteButtonSettings";
import SiteLinkSettings from "./SiteLinkSettings";
import SiteSharingSettings from "./SiteSharingSettings";
import SiteWideChromeLinks from "./SiteWideChromeLinks";

const TABS = [
  { id: "text", label: "Fonts & text", hint: "Heading and body fonts, colours and sizes." },
  { id: "layout", label: "Layout & spacing", hint: "Page width, section spacing, margins and corners." },
  { id: "colours", label: "Colours", hint: "Page background, buttons and links on every page." },
  { id: "cards", label: "Buttons, cards & effects", hint: "Button shape and size, product cards, animation." },
  { id: "chrome", label: "Header & footer", hint: "Menu links, logo, announcement bar and footer." },
  { id: "sharing", label: "Search & social", hint: "How your site looks in Google and when shared." },
] as const;
type TabId = (typeof TABS)[number]["id"];

const CONTENT: Record<TabId, ReactNode> = {
  text: <SiteTypographySettings />,
  layout: <SiteLayoutSettings />,
  colours: (
    <>
      <PageStyleSettings />
      <SiteButtonSettings />
      <SiteLinkSettings />
    </>
  ),
  cards: <SiteCardsEffectsSettings />,
  chrome: <SiteWideChromeLinks />,
  sharing: <SiteSharingSettings />,
};

/** Site Wide Edits as a page over the canvas, opened from the toolbar at any time. */
export default function StudioSiteWidePage() {
  const { siteWideOpen, setSiteWideOpen } = useStudioEditorChrome();
  const { actions } = useEditor();
  const [tab, setTab] = useState<TabId>("text");
  const close = () => setSiteWideOpen?.(false);

  useEffect(() => {
    if (!siteWideOpen) return;
    actions.selectNode(undefined);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSiteWideOpen?.(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [siteWideOpen, setSiteWideOpen, actions]);

  if (!siteWideOpen) return null;
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-[#f5f5f4] px-4 py-6 sm:px-8"
      style={{ top: "var(--studio-toolbar-h, 0px)" }}
      role="dialog"
      aria-label="Site wide edits"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--field)]">Site wide edits</h2>
            <p className="text-sm text-[var(--muted)]">
              These apply to every page. A section&apos;s own settings still win over them.
            </p>
          </div>
          <button type="button" onClick={close} className="rounded-lg bg-[var(--field)] px-4 py-2 text-sm font-semibold text-white">
            Done – back to the page
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
          <nav aria-label="Site wide edit areas" className="flex gap-1 overflow-x-auto md:flex-col">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-current={t.id === tab ? "page" : undefined}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                  t.id === tab ? "bg-white text-[var(--field)] shadow-sm" : "text-[var(--muted)] hover:bg-white/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-base font-bold text-[var(--field)]">{current.label}</h3>
            <p className="mb-2 text-sm text-[var(--muted)]">{current.hint}</p>
            <div className="max-w-2xl [&>div:first-child]:mt-2 [&>div:first-child]:border-t-0 [&>div:first-child]:pt-0">
              {CONTENT[current.id]}
            </div>
            <div className="mt-4">
              <SiteStyleSaveStatus />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
