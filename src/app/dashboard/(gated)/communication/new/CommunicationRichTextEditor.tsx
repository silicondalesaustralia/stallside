"use client";

import { useRef, useState } from "react";

type Props = {
  name?: string;
  maxLength?: number;
};

export default function CommunicationRichTextEditor({
  name = "body",
  maxLength = 8000,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");

  function sync() {
    const el = editorRef.current;
    if (!el) return;
    const next = el.innerHTML.slice(0, maxLength);
    if (next !== el.innerHTML) el.innerHTML = next;
    setHtml(next);
  }

  function run(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function addLink() {
    const raw = window.prompt("Link URL (https://…)");
    if (!raw) return;
    const url = raw.trim();
    if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
      window.alert("Use an https:// or mailto: link.");
      return;
    }
    run("createLink", url);
  }

  const btn =
    "rounded border border-[var(--line)] bg-white px-2.5 py-1 text-sm font-medium hover:bg-[var(--wash)]";

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">Message</span>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={btn} onClick={() => run("bold")}>
          Bold
        </button>
        <button type="button" className={btn} onClick={() => run("italic")}>
          Italic
        </button>
        <button type="button" className={btn} onClick={() => run("underline")}>
          Underline
        </button>
        <button type="button" className={btn} onClick={addLink}>
          Link
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => run("insertUnorderedList")}
        >
          List
        </button>
        <button type="button" className={btn} onClick={() => run("removeFormat")}>
          Clear style
        </button>
      </div>
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline
        aria-label="Message"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        className="min-h-[10rem] rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[var(--leaf)]/30 [&_a]:text-[var(--leaf-dark)] [&_a]:underline"
      />
      <input type="hidden" name={name} value={html} />
      <p className="text-xs text-[var(--muted)]">
        Bold, italic, underline, links, and lists. Button below is optional.
      </p>
    </div>
  );
}
