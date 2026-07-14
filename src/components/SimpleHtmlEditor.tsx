"use client";

import { useEffect, useId, useRef } from "react";
import { normalizeSignHtml } from "@/lib/sanitize-sign-html";

type SimpleHtmlEditorProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
};

function ToolbarButton({
  label,
  onMouseDown,
}: {
  label: string;
  onMouseDown: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown();
      }}
      className="rounded border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold hover:bg-[var(--wash)]"
    >
      {label}
    </button>
  );
}

export default function SimpleHtmlEditor({
  name,
  defaultValue = "",
  placeholder = "",
}: SimpleHtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  function sync() {
    if (!editorRef.current || !inputRef.current) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText.replace(/\u00a0/g, " ").trim();
    inputRef.current.value = text ? html : "";
  }

  function command(cmd: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false);
    sync();
  }

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = normalizeSignHtml(defaultValue);
    sync();
    // Intentional: seed once from saved stand copy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
      <div className="flex flex-wrap gap-1 border-b border-[var(--line)] bg-[var(--wash)] p-2">
        <ToolbarButton label="Bold" onMouseDown={() => command("bold")} />
        <ToolbarButton label="Italic" onMouseDown={() => command("italic")} />
        <ToolbarButton label="Underline" onMouseDown={() => command("underline")} />
        <ToolbarButton label="• List" onMouseDown={() => command("insertUnorderedList")} />
        <ToolbarButton label="1. List" onMouseDown={() => command("insertOrderedList")} />
      </div>
      <div
        id={id}
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline
        aria-label="Instructions"
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        className="min-h-28 px-3 py-2.5 text-sm leading-relaxed outline-none empty:before:text-[var(--muted)] empty:before:content-[attr(data-placeholder)] [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
      />
      <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue} />
    </div>
  );
}
