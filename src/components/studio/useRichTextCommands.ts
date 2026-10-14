"use client";

import { useRef, useState, type RefObject } from "react";

export function markEmpty(el: HTMLElement) {
  el.dataset.empty = el.textContent?.trim() ? "false" : "true";
}

/** Bold/italic/list commands and link editing for a contentEditable box; `commit` saves its contents. */
export function useRichTextCommands(elRef: RefObject<HTMLDivElement | null>, commit: () => void) {
  const rangeRef = useRef<Range | null>(null);
  const anchorRef = useRef<HTMLAnchorElement | null>(null);
  const [linkOpen, setLinkOpenState] = useState(false);
  const [currentHref, setCurrentHref] = useState<string | null>(null);

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

  return { linkOpen, setLinkOpen, closeLink: () => setLinkOpenState(false), currentHref, run, onLink, onUnlink };
}
