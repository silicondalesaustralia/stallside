"use client";

import Link from "next/link";
import { useEditor } from "@craftjs/core";
import { STUDIO_TEMPLATES } from "@/lib/studio/templates";
import { useStudioEditorChrome } from "./StudioEditorContext";

const VIEWPORTS = [
  { label: "Desktop", width: 1280 },
  { label: "Tablet", width: 768 },
  { label: "Mobile", width: 375 },
] as const;

export default function StudioEditorHeader() {
  const {
    viewportWidth,
    setViewportWidth,
    previewUrl,
    isPublished,
    dirty,
    saveStatus,
    onSave,
    onPublish,
    pending,
    templateId,
  } = useStudioEditorChrome();

  const { actions, canUndo, canRedo } = useEditor((_, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const templateLabel = templateId ? STUDIO_TEMPLATES[templateId].label : "Template";

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-white px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-[var(--field)]">Home</span>
        <Link
          href="/dashboard/website/studio/templates"
          className="rounded-lg border border-[var(--line)] px-2.5 py-1 text-xs font-semibold text-[var(--field)]"
        >
          {templateLabel}
        </Link>
        <div className="flex rounded-lg border border-[var(--line)] bg-[#fafaf9] p-0.5">
          {VIEWPORTS.map((vp) => (
            <button
              key={vp.label}
              type="button"
              onClick={() => setViewportWidth(vp.width)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                viewportWidth === vp.width
                  ? "bg-white text-[var(--field)] shadow-sm"
                  : "text-[var(--muted)]"
              }`}
            >
              {vp.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {dirty ? (
          <span className="text-xs text-[var(--muted)]">
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : "Unsaved"}
          </span>
        ) : null}
        <button type="button" disabled={!canUndo} onClick={() => actions.history.undo()} className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs font-semibold disabled:opacity-40">
          Undo
        </button>
        <button type="button" disabled={!canRedo} onClick={() => actions.history.redo()} className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs font-semibold disabled:opacity-40">
          Redo
        </button>
        <a href={previewUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold">
          Preview
        </a>
        <button type="button" disabled={pending} onClick={onSave} className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold disabled:opacity-60">
          Save draft
        </button>
        <button type="button" disabled={pending} onClick={onPublish} className="rounded-lg bg-[var(--field)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
          {isPublished ? "Update published" : "Publish"}
        </button>
      </div>
    </header>
  );
}
