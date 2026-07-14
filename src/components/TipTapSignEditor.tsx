"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { FontSize } from "@/lib/tiptap-font-size";
import { normalizeSignHtml } from "@/lib/sanitize-sign-html";
import TipTapToolbar from "@/components/TipTapToolbar";

type TipTapSignEditorProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeightClass?: string;
};

export default function TipTapSignEditor({
  name,
  defaultValue = "",
  placeholder = "Write here…",
  minHeightClass = "min-h-28",
}: TipTapSignEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: normalizeSignHtml(defaultValue) || "",
    editorProps: {
      attributes: {
        class: `tiptap ProseMirror ${minHeightClass} px-3 py-2.5 text-sm leading-relaxed outline-none [&_h2]:my-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:my-1.5 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5`,
      },
    },
    onUpdate: ({ editor: current }) => {
      if (!inputRef.current) return;
      inputRef.current.value = current.isEmpty ? "" : current.getHTML();
    },
  });

  useEffect(() => {
    if (!inputRef.current || !editor) return;
    inputRef.current.value = editor.isEmpty ? "" : editor.getHTML();
  }, [editor]);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
      {editor ? <TipTapToolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
      <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue} />
    </div>
  );
}
