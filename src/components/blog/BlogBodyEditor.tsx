"use client";

import { useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";

const CONTENT_STYLE = `
  body { font-family: Arial, Helvetica, sans-serif; font-size: 17px; line-height: 1.65; color: #182c1b; max-width: 46rem; margin: 1rem auto; }
  h2 { font-size: 1.6rem; margin-top: 2rem; color: #17361f; }
  h3 { font-size: 1.3rem; margin-top: 1.5rem; color: #17361f; }
  h4 { font-size: 1.1rem; color: #17361f; }
  a { color: #1e5a2c; }
  blockquote { border-left: 4px solid #f5a623; padding-left: 1rem; color: #56684f; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #d4e0cd; padding: 6px; }
  img { max-width: 100%; height: auto; }
`;

type Props = {
  name: string;
  defaultValue?: string;
  height?: number;
  onChange?: (html: string) => void;
};

/** Long-form article editor; writes HTML into a hidden input for server actions. */
export default function BlogBodyEditor({ name, defaultValue = "", height = 640, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  function sync(editor: TinyMCEEditor) {
    const html = editor.getContent({ format: "html" }).trim();
    if (inputRef.current) inputRef.current.value = html;
    onChangeRef.current?.(html);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
      <Editor
        licenseKey="gpl"
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        initialValue={defaultValue || undefined}
        onEditorChange={(_value, editor) => sync(editor)}
        init={{
          height,
          menubar: false,
          branding: false,
          promotion: false,
          plugins: "lists link autolink image table code wordcount",
          toolbar:
            "undo redo | blocks | bold italic strikethrough | " +
            "bullist numlist blockquote | link image table | removeformat | code",
          block_formats: "Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4",
          content_style: CONTENT_STYLE,
          convert_urls: false,
          relative_urls: false,
          entity_encoding: "raw",
          image_dimensions: true,
          link_default_target: "",
          table_default_styles: {},
          table_default_attributes: {},
          invalid_styles: "color background-color font-family font-size",
        }}
      />
      <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue} />
    </div>
  );
}
