"use client";

import type { Editor } from "@tiptap/react";

function Btn({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded border px-2 py-1 text-xs font-semibold ${
        active
          ? "border-[var(--leaf)] bg-[var(--leaf)] text-white"
          : "border-[var(--line)] bg-white hover:bg-[var(--wash)]"
      }`}
    >
      {label}
    </button>
  );
}

export default function TipTapToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--line)] bg-[var(--wash)] p-2">
      <Btn
        label="B"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <Btn
        label="I"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Btn
        label="U"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <Btn
        label="S"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <Btn
        label="H2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <Btn
        label="H3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <Btn
        label="• List"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <Btn
        label="1. List"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <Btn
        label="Center"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      />
      <Btn
        label="Left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      />
      <label className="flex items-center gap-1 rounded border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold">
        Colour
        <input
          type="color"
          className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />
      </label>
      <label className="flex items-center gap-1 rounded border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold">
        Highlight
        <input
          type="color"
          defaultValue="#f4d03f"
          className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
          onChange={(e) =>
            editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
          }
        />
      </label>
      <select
        aria-label="Font size"
        className="rounded border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold"
        defaultValue=""
        onChange={(e) => {
          if (!e.target.value) return;
          editor.chain().focus().setFontSize(e.target.value).run();
          e.target.value = "";
        }}
      >
        <option value="">Size</option>
        <option value="16px">Normal</option>
        <option value="20px">Large</option>
        <option value="28px">XL</option>
        <option value="36px">XXL</option>
        <option value="48px">Huge</option>
        <option value="64px">Poster</option>
      </select>
      <select
        aria-label="Font"
        className="rounded border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold"
        defaultValue=""
        onChange={(e) => {
          if (!e.target.value) return;
          editor.chain().focus().setFontFamily(e.target.value).run();
          e.target.value = "";
        }}
      >
        <option value="">Font</option>
        <option value="Georgia, serif">Serif</option>
        <option value="Arial, Helvetica, sans-serif">Sans</option>
        <option value="Courier New, monospace">Mono</option>
        <option value="Impact, Haettenschweiler, sans-serif">Impact</option>
      </select>
      <Btn label="Clear" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} />
    </div>
  );
}
