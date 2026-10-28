"use client";

import { useEffect, useRef, type ReactNode } from "react";
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
import SiteFaviconSettings from "./SiteFaviconSettings";
import SiteWideChromeLinks from "./SiteWideChromeLinks";
import ShopBrowseSettings from "./ShopBrowseSettings";
import SaleBadgeSettings from "./SaleBadgeSettings";
import { SITE_WIDE_TABS as TABS, type SiteWideTabId } from "@/lib/studio/site-wide-tabs";

const CONTENT: Record<SiteWideTabId, ReactNode> = {
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
  favicon: <SiteFaviconSettings />,
  shop: (
    <>
      <ShopBrowseSettings />
      <SaleBadgeSettings />
    </>
  ),
};

/** Site Wide Edits as a page over the canvas, opened from the toolbar at any time. */
export default function StudioSiteWidePage() {
  const { siteWideOpen, setSiteWideOpen, siteWideTab: tab = "text", setSiteWideTab: setTab = () => {} } =
    useStudioEditorChrome();
  const { actions } = useEditor();
  const pageRef = useRef<HTMLDivElement>(null);
  const close = () => setSiteWideOpen?.(false);

  useEffect(() => {
    const page = pageRef.current;
    const toolbar = document.querySelector<HTMLElement>(".vendl-studio-editor__toolbar");
    if (!siteWideOpen || !page || !toolbar) return;
    const place = () => {
      page.style.top = `${Math.max(0, toolbar.getBoundingClientRect().bottom)}px`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(toolbar);
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [siteWideOpen]);

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
      ref={pageRef}
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
