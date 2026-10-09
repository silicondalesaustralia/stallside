"use client";

import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useNode } from "@craftjs/core";

type TextTag = "h1" | "h2" | "h3" | "p" | "span" | "div";

type Props = {
  prop: string;
  value: string;
  as?: TextTag;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
};

/** Click-to-edit text bound to the current Craft node prop. */
export default function InlineEditableText({
  prop,
  value,
  as: Tag = "p",
  className = "",
  multiline = false,
  placeholder = "Click to edit",
}: Props) {
  const {
    actions: { setProp },
  } = useNode();
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    const next = value || "";
    if (el.innerText !== next) el.innerText = next;
  }, [value]);

  function commit() {
    const el = elRef.current;
    if (!el) return;
    const next = (multiline ? el.innerText : el.textContent ?? "")
      .replace(/\u00a0/g, " ")
      .replace(/\n+$/g, "")
      .trimEnd();
    setProp((props: Record<string, unknown>) => {
      props[prop] = next;
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    e.stopPropagation();
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
    if (e.key === "Escape") {
      if (elRef.current) elRef.current.innerText = value || "";
      e.currentTarget.blur();
    }
  }

  function onMouseDown(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <Tag
      ref={(node) => {
        elRef.current = node;
      }}
      className={`inline-editable ${className}`.trim()}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={commit}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      role="textbox"
      aria-label={placeholder}
    />
  );
}
