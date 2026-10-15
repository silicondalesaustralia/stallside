"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Phone-only bar that appears once the main Add to cart buttons scroll out of view.
 * Products with options scroll back to the choices; others add straight away.
 */
export default function ProductStickyCart({
  actionsRef,
  name,
  price,
  hasOptions,
  soldOut,
  addLabel,
}: {
  actionsRef: RefObject<HTMLDivElement | null>;
  name: string;
  price: string;
  hasOptions: boolean;
  soldOut: boolean;
  addLabel: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = actionsRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [actionsRef]);

  function onAdd() {
    const target = actionsRef.current;
    if (!target) return;
    const add = target.querySelector<HTMLButtonElement>("[data-product-add]");
    if (hasOptions || !add || add.disabled) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    add.click();
  }

  if (!show || soldOut) return null;
  return (
    <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel,#fff)] p-2.5 pl-4 shadow-lg sf-md:hidden">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--field)]">{name}</p>
        <p className="font-receipt text-sm text-[var(--muted)]">{price}</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="studio-btn studio-btn--primary shrink-0 py-2"
      >
        {hasOptions ? "Choose options" : addLabel}
      </button>
    </div>
  );
}
