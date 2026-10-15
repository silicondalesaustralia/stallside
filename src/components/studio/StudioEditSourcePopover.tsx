"use client";

import { useEffect, useRef, useState } from "react";
import { resolveEditSource, type EditSource } from "@/lib/studio/edit-sources";
import { useStudioEditorChrome } from "./StudioEditorContext";

const WIDTH = 288;

function showSettingsColumn() {
  const column = document.querySelector<HTMLElement>(".vendl-studio-settings-column");
  if (!column) return;
  column.scrollIntoView({ behavior: "smooth", block: "nearest" });
  column.animate(
    [{ boxShadow: "inset 0 0 0 3px var(--leaf)" }, { boxShadow: "inset 0 0 0 3px transparent" }],
    { duration: 1200 },
  );
}

/** In the editor, clicking a part that isn't edited on the page says where it is edited. */
export default function StudioEditSourcePopover() {
  const { setSiteWideOpen, setSiteWideTab } = useStudioEditorChrome();
  const [open, setOpen] = useState<{ source: EditSource; x: number; y: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element) || boxRef.current?.contains(target)) return;
      const source = target.closest(".vendl-studio-editor__viewport") ? resolveEditSource(target) : null;
      if (source) e.preventDefault();
      setOpen(source ? { source, x: e.clientX, y: e.clientY } : null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const close = () => setOpen(null);
    document.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, []);

  if (!open) return null;
  const { source } = open;
  const left = Math.max(8, Math.min(open.x - WIDTH / 2, window.innerWidth - WIDTH - 8));
  const below = open.y + 12;
  const top = below + 160 > window.innerHeight ? Math.max(8, open.y - 172) : below;
  const tab = source.siteWideTab;

  return (
    <div
      ref={boxRef}
      role="dialog"
      aria-label={`Edit ${source.title}`}
      className="fixed z-[60] rounded-xl border border-[var(--line)] bg-white p-4 text-sm shadow-lg"
      style={{ left, top, width: WIDTH }}
    >
      <p className="font-bold text-[var(--field)]">Edit this section: {source.title}</p>
      <p className="mt-1 text-[var(--muted)]">{source.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {source.link ? (
          <a
            href={source.link.href}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(null)}
            className="rounded-lg bg-[var(--field)] px-3 py-1.5 font-semibold text-white"
          >
            {source.link.label} ↗
          </a>
        ) : null}
        {tab ? (
          <button
            type="button"
            onClick={() => {
              setSiteWideTab?.(tab);
              setSiteWideOpen?.(true);
              setOpen(null);
            }}
            className="rounded-lg bg-[var(--field)] px-3 py-1.5 font-semibold text-white"
          >
            Open Site Wide Edits
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              showSettingsColumn();
              setOpen(null);
            }}
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 font-semibold text-[var(--field)]"
          >
            Section settings
          </button>
        )}
      </div>
    </div>
  );
}
