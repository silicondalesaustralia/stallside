"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type FocusEvent, type KeyboardEvent } from "react";
import { useNode } from "@craftjs/core";
import { parseRichText } from "@/lib/website/rich-text/parse";
import { richTextToHtml } from "@/lib/website/rich-text/serialize";
import { domToRichText } from "@/lib/website/rich-text/from-dom";
import RichTextToolbar from "./RichTextToolbar";
import { markEmpty, useRichTextCommands } from "./useRichTextCommands";

type Props = { prop: string; value: string; className?: string; placeholder?: string };

/** Click-to-edit body text with bold, italic, links and lists, bound to a Craft node prop. */
export default function InlineRichText({ prop, value, className = "", placeholder = "Click to edit" }: Props) {
  const { actions: { setProp } } = useNode();
  const elRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el || el.contains(document.activeElement)) return;
    const html = richTextToHtml(parseRichText(value || ""));
    if (el.innerHTML !== html) el.innerHTML = html;
    markEmpty(el);
  }, [value]);

  function commit() {
    const el = elRef.current;
    if (!el) return;
    const next = domToRichText(el);
    if (next !== value) setProp((props: Record<string, unknown>) => { props[prop] = next; });
  }

  const { linkOpen, setLinkOpen, closeLink, currentHref, run, onLink, onUnlink } = useRichTextCommands(elRef, commit);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    e.stopPropagation();
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setLinkOpen(true);
    }
    if (e.key === "Escape" && elRef.current) {
      elRef.current.innerHTML = richTextToHtml(parseRichText(value || ""));
      elRef.current.blur();
    }
  }

  function onPaste(e: ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    run("insertText", e.clipboardData.getData("text/plain"));
  }

  function onBlur(e: FocusEvent<HTMLDivElement>) {
    if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
    setActive(false);
    closeLink();
    commit();
  }

  return (
    <div className="relative" onFocus={() => setActive(true)} onBlur={onBlur}>
      {active ? (
        <RichTextToolbar
          onCommand={(command) => run(command)}
          onLink={onLink}
          onUnlink={onUnlink}
          linkOpen={linkOpen}
          setLinkOpen={setLinkOpen}
          currentHref={currentHref}
        />
      ) : null}
      <div
        ref={elRef}
        className={`inline-editable inline-rich studio-rich-text ${className}`.trim()}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        onFocus={() => {
          document.execCommand("defaultParagraphSeparator", false, "p");
          document.execCommand("styleWithCSS", false, "false");
        }}
        onInput={(e) => markEmpty(e.currentTarget)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onMouseDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}
