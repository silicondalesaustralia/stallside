"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { parseRichText } from "@/lib/website/rich-text/parse";
import { richTextToHtml } from "@/lib/website/rich-text/serialize";
import { domToRichText } from "@/lib/website/rich-text/from-dom";
import RichTextToolbar from "@/components/studio/RichTextToolbar";
import { markEmpty, useRichTextCommands } from "@/components/studio/useRichTextCommands";

type Props = {
  name: string;
  label: string;
  defaultValue: string | null;
  placeholder?: string;
  maxLength?: number;
};

/** Form field with bold, italic, links and lists. Submits the light formatting text under `name`. */
export default function RichTextField({ name, label, defaultValue, placeholder = "", maxLength }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(defaultValue ?? "");
  const over = maxLength !== undefined && value.length > maxLength;

  useEffect(() => {
    const el = elRef.current;
    if (!el || el.contains(document.activeElement)) return;
    el.innerHTML = richTextToHtml(parseRichText(defaultValue ?? ""));
    markEmpty(el);
  }, [defaultValue]);

  function commit() {
    if (elRef.current) setValue(domToRichText(elRef.current));
  }

  const { linkOpen, setLinkOpen, currentHref, run, onLink, onUnlink } = useRichTextCommands(elRef, commit);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setLinkOpen(true);
    }
  }

  function onPaste(e: ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    run("insertText", e.clipboardData.getData("text/plain"));
    commit();
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <div className="relative overflow-visible rounded-lg border border-[var(--line)] bg-white focus-within:border-[var(--leaf)] focus-within:ring-2 focus-within:ring-[var(--leaf)]/15">
        <RichTextToolbar
          docked
          onCommand={(command) => {
            run(command);
            commit();
          }}
          onLink={onLink}
          onUnlink={onUnlink}
          linkOpen={linkOpen}
          setLinkOpen={setLinkOpen}
          currentHref={currentHref}
        />
        <div className="px-3 py-2.5">
          <div
            ref={elRef}
            className="inline-rich studio-rich-text min-h-[7rem] text-base leading-relaxed outline-none"
            contentEditable
            suppressContentEditableWarning
            data-placeholder={placeholder}
            role="textbox"
            aria-multiline="true"
            aria-label={label}
            onFocus={() => {
              document.execCommand("defaultParagraphSeparator", false, "p");
              document.execCommand("styleWithCSS", false, "false");
            }}
            onInput={(e) => {
              markEmpty(e.currentTarget);
              commit();
            }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
          />
        </div>
      </div>
      <input type="hidden" name={name} value={value} />
      {maxLength !== undefined ? (
        <span className={`self-end text-xs ${over ? "font-semibold text-[var(--gone)]" : "text-[var(--muted)]"}`}>
          {value.length} / {maxLength}
        </span>
      ) : null}
    </div>
  );
}
