"use client";

import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { normalizeSignHtml } from "@/lib/sanitize-sign-html";
import { SIGN_HTML_CONTENT_STYLE } from "@/lib/sign-html-content-style";

type SignHtmlEditorProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  height?: number;
};

function isEmptyBlock(el: Element) {
  return !el.innerHTML.replace(/\s|&nbsp;|<br\s*\/?>/gi, "");
}

export default function SignHtmlEditor({
  name,
  defaultValue = "",
  placeholder = "Write here…",
  height = 220,
}: SignHtmlEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initial = normalizeSignHtml(defaultValue);

  function sync(editor: TinyMCEEditor) {
    if (!inputRef.current) return;
    const html = editor.getContent({ format: "html" }).trim();
    const text = editor.getContent({ format: "text" }).trim();
    inputRef.current.value = text ? html : "";
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
      <Editor
        licenseKey="gpl"
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        initialValue={initial || undefined}
        onInit={(_event, editor) => sync(editor)}
        onEditorChange={(_value, editor) => sync(editor)}
        init={{
          height,
          menubar: false,
          branding: false,
          promotion: false,
          statusbar: false,
          plugins: "lists link autolink code",
          toolbar:
            "undo redo | blocks | bold italic underline strikethrough | " +
            "alignleft aligncenter alignright | bullist numlist | " +
            "forecolor backcolor | fontfamily fontsize | removeformat | code",
          font_size_formats: "12px 14px 16px 18px 20px 24px 28px 36px 48px 64px",
          font_family_formats:
            "Sans=Arial,Helvetica,sans-serif; Serif=Georgia,serif; Mono=Courier New,monospace; Impact=Impact,Haettenschweiler,sans-serif",
          block_formats: "Paragraph=p; Heading 2=h2; Heading 3=h3",
          placeholder,
          content_style: SIGN_HTML_CONTENT_STYLE,
          forced_root_block: "p",
          remove_trailing_brs: true,
          convert_urls: false,
          formats: {
            removeformat: [
              {
                selector:
                  "b,strong,em,i,font,u,strike,s,sub,sup,dfn,code,samp,kbd,var,cite,mark,q,del,ins",
                remove: "all",
                split: true,
                expand: false,
                block_expand: true,
                deep: true,
              },
              {
                selector: "span",
                attributes: ["style", "class"],
                remove: "empty",
                split: true,
                expand: false,
                deep: true,
              },
            ],
          },
          setup: (editor) => {
            editor.on("NodeChange SetContent", () => {
              const body = editor.getBody();
              if (!body) return;
              // Drop only leading/trailing empty paragraphs TinyMCE inserts
              // around lists — keep blank lines in the middle for spacing.
              while (
                body.firstChild instanceof HTMLElement &&
                body.firstChild.nodeName === "P" &&
                isEmptyBlock(body.firstChild) &&
                body.childNodes.length > 1
              ) {
                body.firstChild.remove();
              }
              while (
                body.lastChild instanceof HTMLElement &&
                body.lastChild.nodeName === "P" &&
                isEmptyBlock(body.lastChild) &&
                body.childNodes.length > 1
              ) {
                body.lastChild.remove();
              }
            });
          },
        }}
      />
      <input ref={inputRef} type="hidden" name={name} defaultValue={initial} />
    </div>
  );
}
