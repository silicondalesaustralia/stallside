"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { standCatalogPath, standCategoryPath } from "@/lib/stand-seo";

const itemClass =
  "block truncate rounded-lg px-3 py-2 text-sm outline-none hover:bg-[var(--wash)] focus-visible:bg-[var(--wash)]";

export default function StandShopDropdown({
  standSlug,
  categories,
  active,
  activeCategory,
  tabClass,
}: {
  standSlug: string;
  categories: { slug: string; title: string }[];
  active: boolean;
  activeCategory: string | null;
  tabClass: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    rootRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onMenuKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>("[role=menuitem]"),
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    const step = e.key === "ArrowDown" ? 1 : -1;
    items[(index + step + items.length) % items.length]?.focus();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={`${tabClass} inline-flex items-center gap-1.5`}
      >
        Shop
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Shop"
          onKeyDown={onMenuKey}
          className="absolute left-1/2 top-full z-30 mt-2 w-60 -translate-x-1/2 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1.5 text-left shadow-lg"
        >
          <Link
            role="menuitem"
            href={standCatalogPath(standSlug)}
            onClick={() => setOpen(false)}
            aria-current={active && !activeCategory ? "page" : undefined}
            className={`${itemClass} font-semibold text-[var(--field)]`}
          >
            All products
          </Link>
          <div role="separator" className="my-1 h-px bg-[var(--line)]" />
          <div className="max-h-72 overflow-y-auto">
            {categories.map((c) => {
              const current = c.slug === activeCategory;
              return (
                <Link
                  key={c.slug}
                  role="menuitem"
                  href={standCategoryPath(standSlug, c.slug)}
                  onClick={() => setOpen(false)}
                  aria-current={current ? "page" : undefined}
                  title={c.title}
                  className={`${itemClass} ${
                    current ? "bg-[var(--wash)] font-semibold text-[var(--leaf-dark)]" : "text-[var(--ink)]"
                  }`}
                >
                  {c.title}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
