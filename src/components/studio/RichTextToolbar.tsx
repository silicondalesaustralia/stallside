"use client";

import { useState, type MouseEvent, type SyntheticEvent } from "react";
import { normaliseLinkInput } from "@/lib/website/rich-text/parse";

type Command = "bold" | "italic" | "insertUnorderedList" | "insertOrderedList" | "removeFormat";

const BTN =
  "inline-flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs font-semibold text-[#17361f] hover:bg-[#f2f6ef]";

/** Floating formatting bar for `InlineRichText`. Buttons keep the text selection (no focus steal). */
export default function RichTextToolbar({
  onCommand,
  onLink,
  onUnlink,
  linkOpen,
  setLinkOpen,
  currentHref,
  docked = false,
}: {
  onCommand: (command: Command) => void;
  onLink: (href: string) => void;
  onUnlink: () => void;
  linkOpen: boolean;
  setLinkOpen: (open: boolean) => void;
  currentHref: string | null;
  /** Sits at the top of a text box instead of floating above it. */
  docked?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const keep = (e: MouseEvent) => e.preventDefault();

  function submit(e: SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    const href = normaliseLinkInput(draft);
    if (!href) {
      setError("Enter a web address, email or phone (tel:…).");
      return;
    }
    setError(null);
    onLink(href);
  }

  return (
    <div
      className={
        docked
          ? "border-b border-[#d9e2d4] bg-[#fbfdf9] p-1 text-left"
          : "absolute bottom-full left-0 z-40 mb-2 rounded-lg border border-[#d9e2d4] bg-white p-1 text-left shadow-lg"
      }
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="toolbar"
      aria-label="Text formatting"
    >
      <div className="flex items-center gap-0.5">
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => onCommand("bold")} aria-label="Bold" title="Bold (Ctrl/⌘+B)">
          <strong>B</strong>
        </button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => onCommand("italic")} aria-label="Italic" title="Italic (Ctrl/⌘+I)">
          <em className="font-serif">I</em>
        </button>
        <button
          type="button"
          className={`${BTN} ${linkOpen || currentHref ? "bg-[#f2f6ef]" : ""}`}
          onMouseDown={keep}
          onClick={() => {
            setDraft(currentHref ?? "");
            setError(null);
            setLinkOpen(!linkOpen);
          }}
          aria-label="Link"
          title="Link (Ctrl/⌘+K)"
        >
          Link
        </button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => onCommand("insertUnorderedList")} aria-label="Bulleted list" title="Bulleted list">
          • List
        </button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => onCommand("insertOrderedList")} aria-label="Numbered list" title="Numbered list">
          1. List
        </button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => onCommand("removeFormat")} aria-label="Clear formatting" title="Clear formatting">
          Clear
        </button>
      </div>
      {linkOpen ? (
        <div className="mt-1 flex items-center gap-1 border-t border-[#d9e2d4] pt-1" role="group" aria-label="Link">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setLinkOpen(false);
              if (e.key === "Enter") submit(e);
            }}
            placeholder="https://… or email"
            className="w-48 rounded border border-[#d9e2d4] px-2 py-1 text-xs text-[#17361f]"
            aria-label="Link address"
          />
          <button type="button" className={BTN} onClick={submit}>
            Apply
          </button>
          {currentHref ? (
            <button type="button" className={BTN} onClick={onUnlink}>
              Remove
            </button>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="px-1 pt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
