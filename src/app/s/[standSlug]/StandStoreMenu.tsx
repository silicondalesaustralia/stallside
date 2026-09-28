"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { standCategoryPath } from "@/lib/stand-seo";
import type { StandStoreNav } from "@/lib/stand-store-nav";
import { activeCategorySlug, activeStoreSection } from "@/lib/stand-store-active";
import { buildStandStoreLinks } from "./StandStoreLinks";

const itemClass = "block rounded-lg px-3 py-2.5 text-sm text-[var(--ink-on-dark)] hover:bg-white/10";

export default function StandStoreMenu({
  standSlug,
  nav,
}: {
  standSlug: string;
  nav: StandStoreNav;
}) {
  const pathname = usePathname() ?? "";
  const section = activeStoreSection(pathname, standSlug);
  const activeCategory = activeCategorySlug(pathname, standSlug);
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(activeCategory != null);
  const links = buildStandStoreLinks(standSlug, nav);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (links.length === 0) return null;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel)]"
      >
        <span className="flex flex-col gap-1" aria-hidden>
          <span className="block h-0.5 w-4 bg-[var(--field)]" />
          <span className="block h-0.5 w-4 bg-[var(--field)]" />
          <span className="block h-0.5 w-4 bg-[var(--field)]" />
        </span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-[var(--field)]/55"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-3 top-3 w-[min(16rem,calc(100vw-1.5rem))] rounded-2xl bg-[var(--field)] p-4 shadow-2xl [color-scheme:dark]">
            <nav aria-label="Shop sections" className="flex flex-col gap-0.5">
              {links.map((link) => {
                const hasCategories = link.key === "shop" && nav.categories.length > 0;
                return (
                  <Fragment key={link.key}>
                    <div className="flex items-center">
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={section === link.key && !activeCategory ? "page" : undefined}
                        className={`${itemClass} flex-1 font-semibold ${
                          section === link.key && !activeCategory ? "bg-white/10" : ""
                        }`}
                      >
                        {link.label}
                      </Link>
                      {hasCategories ? (
                        <button
                          type="button"
                          aria-expanded={shopOpen}
                          aria-label={shopOpen ? "Hide categories" : "Show categories"}
                          onClick={() => setShopOpen((v) => !v)}
                          className="flex size-10 items-center justify-center rounded-lg text-[var(--ink-on-dark)] hover:bg-white/10"
                        >
                          <svg aria-hidden viewBox="0 0 12 12" className={`size-3 transition-transform ${shopOpen ? "rotate-180" : ""}`}>
                            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                    {hasCategories && shopOpen ? (
                      <div className="mb-1 ml-3 flex flex-col border-l border-white/15 pl-2">
                        {nav.categories.map((c) => (
                          <Link
                            key={c.slug}
                            href={standCategoryPath(standSlug, c.slug)}
                            onClick={() => setOpen(false)}
                            aria-current={c.slug === activeCategory ? "page" : undefined}
                            className={`${itemClass} truncate ${
                              c.slug === activeCategory ? "bg-white/10 font-semibold" : "text-[var(--ink-on-dark)]/80"
                            }`}
                          >
                            {c.title}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </Fragment>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
