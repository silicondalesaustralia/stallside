"use client";

import { useState } from "react";
import { usePuck } from "@puckeditor/core";
import { useEditorChrome } from "./EditorChromeContext";

const VIEWPORT_WIDTHS = [
  { key: "desktop", width: 1280, label: "Desktop" },
  { key: "tablet", width: 768, label: "Tablet" },
  { key: "mobile", width: 375, label: "Mobile" },
] as const;

export default function VendlEditorHeader() {
  const { dispatch, appState, history } = usePuck();
  const {
    previewUrl,
    isPublished,
    pending,
    dirty,
    saveStatus,
    onSave,
    onPublish,
    setShowSectionsPanel,
    showSectionsPanel,
  } = useEditorChrome();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentWidth = appState.ui.viewports.current.width;

  function setViewport(width: number) {
    dispatch({
      type: "setUi",
      ui: (ui) => ({
        ...ui,
        viewports: {
          ...ui.viewports,
          current: { width, height: "auto" },
          controlsVisible: false,
        },
      }),
    });
  }

  return (
    <header className="vendl-editor-header flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-white px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-[var(--field)]">Home</span>
        <div className="flex rounded-lg border border-[var(--line)] bg-[#fafaf9] p-0.5">
          {VIEWPORT_WIDTHS.map((vp) => (
            <button
              key={vp.key}
              type="button"
              title={`${vp.label} preview`}
              onClick={() => setViewport(vp.width)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                currentWidth === vp.width
                  ? "bg-white text-[var(--field)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--field)]"
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
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? "Saved"
                : "Unsaved changes"}
          </span>
        ) : null}
        <div className="relative">
          <button
            type="button"
            aria-label="More options"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--field)]"
          >
            ⋯
          </button>
          {menuOpen ? (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-lg border border-[var(--line)] bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setShowSectionsPanel(!showSectionsPanel);
                    setMenuOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-[var(--field)] hover:bg-[var(--wash)]"
                >
                  {showSectionsPanel ? "Hide sections list" : "Sections list"}
                </button>
                <button
                  type="button"
                  disabled={!history.hasPast}
                  onClick={() => {
                    history.back();
                    setMenuOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-[var(--field)] hover:bg-[var(--wash)] disabled:opacity-40"
                >
                  Undo
                </button>
                <button
                  type="button"
                  disabled={!history.hasFuture}
                  onClick={() => {
                    history.forward();
                    setMenuOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-[var(--field)] hover:bg-[var(--wash)] disabled:opacity-40"
                >
                  Redo
                </button>
              </div>
            </>
          ) : null}
        </div>
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold text-[var(--field)]"
        >
          Preview
        </a>
        <button
          type="button"
          disabled={pending}
          onClick={onSave}
          className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold text-[var(--field)] disabled:opacity-60"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onPublish}
          className="rounded-lg bg-[var(--field)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPublished ? "Update published" : "Publish"}
        </button>
      </div>
    </header>
  );
}
