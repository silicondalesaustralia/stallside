"use client";

import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useNode } from "@craftjs/core";
import { withSectionText } from "@/lib/studio/section-texts";

export type TextTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

type Props = {
  prop: string;
  value: string;
  as: TextTag;
  sectionHeading: boolean;
  className: string;
  multiline: boolean;
  placeholder: string;
  /** For `texts.<key>` props: the default copy, restored when the text is cleared. */
  defaultValue?: string;
};

/** The contentEditable element behind `InlineEditableText`. */
export default function EditableTextElement({
  prop,
  value,
  as: Tag,
  sectionHeading,
  className,
  multiline,
  placeholder,
  defaultValue = "",
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
    const isCopy = prop.startsWith("texts.");
    if (isCopy && !next.trim()) el.innerText = defaultValue;
    setProp((props: Record<string, unknown>) => {
      if (isCopy) {
        props.texts = withSectionText(props.texts, prop.slice(6), next, defaultValue);
      } else {
        props[prop] = next;
      }
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
      data-section-heading={sectionHeading ? "" : undefined}
      onBlur={commit}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      onClick={(e) => e.preventDefault()}
      role="textbox"
      aria-label={placeholder}
    />
  );
}
