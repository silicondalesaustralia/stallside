"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type FocusEvent, type KeyboardEvent } from "react";
import { useNode } from "@craftjs/core";
import { parseRichText } from "@/lib/website/rich-text/parse";
import { richTextToHtml } from "@/lib/website/rich-text/serialize";
import { domToRichText } from "@/lib/website/rich-text/from-dom";
import RichTextToolbar from "./RichTextToolbar";

type Props = { prop: string; value: string; className?: string; placeholder?: string };

function markEmpty(el: HTMLElement) {
  el.dataset.empty = el.textContent?.trim() ? "false" : "true";
}

/** Click-to-edit body text with bold, italic, links and lists, bound to a Craft node prop. */
export default function InlineRichText({ prop, value, className = "", placeholder = "Click to edit" }: Props) {
  const { actions: { setProp } } = useNode();
  const elRef = useRef<HTMLDivElement | null>(null);
  const rangeRef = useRef<Range | null>(null);
  const anchorRef = useRef<HTMLAnchorElement | null>(null);
  const [active, setActive] = useState(false);
  const [linkOpen, setLinkOpenState] = useState(false);
  const [currentHref, setCurrentHref] = useState<string | null>(null);

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

  function linkAtSelection(): HTMLAnchorElement | null {
    const node = window.getSelection()?.anchorNode;
    const el = node instanceof Element ? node : node?.parentElement;
    const a = el?.closest("a") ?? null;
    return a && elRef.current?.contains(a) ? a : null;
  }

  function setLinkOpen(open: boolean) {
    if (open) {
      const sel = window.getSelection();
      const inside = sel && sel.rangeCount > 0 && elRef.current?.contains(sel.anchorNode);
      rangeRef.current = inside ? sel.getRangeAt(0).cloneRange() : null;
      anchorRef.current = linkAtSelection();
      setCurrentHref(anchorRef.current?.getAttribute("href") ?? null);
    }
    setLinkOpenState(open);
  }

  function restoreSelection() {
    const el = elRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (rangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(rangeRef.current);
    }
  }

  function run(command: string, arg?: string) {
    document.execCommand(command, false, arg);
    if (elRef.current) markEmpty(elRef.current);
  }

  function onLink(href: string) {
    restoreSelection();
    const range = rangeRef.current;
    if (anchorRef.current && (!range || range.collapsed)) {
      anchorRef.current.setAttribute("href", href);
    } else if (range && !range.collapsed) {
      run("createLink", href);
    } else if (elRef.current) {
      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = href.replace(/^(mailto|tel):/, "");
      if (range) range.insertNode(a);
      else elRef.current.appendChild(a);
      markEmpty(elRef.current);
    }
    setLinkOpenState(false);
    commit();
  }

  function onUnlink() {
    restoreSelection();
    const a = anchorRef.current;
    const sel = window.getSelection();
    if (a && sel) {
      const range = document.createRange();
      range.selectNodeContents(a);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    run("unlink");
    setLinkOpenState(false);
    commit();
  }

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
    setLinkOpenState(false);
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
