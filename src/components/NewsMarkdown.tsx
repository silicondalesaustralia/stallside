import Image from "next/image";
import type { ReactNode } from "react";
import { renderInlineMarkdown } from "@/components/news-inline-markdown";
import {
  NewsMarkdownList,
  NewsMarkdownTable,
  newsTableClass,
  parseMarkdownTable,
} from "@/components/news-markdown-blocks";

type Props = {
  source: string;
  skipFirstH1?: boolean;
};

function headingClass(level: number, text: string) {
  const base =
    "font-[family-name:var(--font-display)] font-bold text-[var(--field)]";
  const size =
    level === 2 ? "mt-12 text-2xl sm:text-3xl" : "mt-8 text-xl sm:text-2xl";
  const special = text === "High-Level Verdict" ? " post-verdict" : "";
  return `${base} ${size}${special}`;
}

export default function NewsMarkdown({ source, skipFirstH1 = true }: Props) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let skippedH1 = false;
  let lastH2 = "";
  let inVerdict = false;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) {
      blocks.push(
        <figure key={key++} className="my-8">
          <Image
            src={img[2]}
            alt={img[1]}
            width={1024}
            height={img[2].includes("bakesy") ? 615 : 341}
            className="h-auto w-full rounded-[var(--radius-md)]"
          />
          {img[1] ? (
            <figcaption className="mt-2 text-sm text-[var(--muted)]">
              {img[1]}
            </figcaption>
          ) : null}
        </figure>,
      );
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      if (level === 1 && skipFirstH1 && !skippedH1) {
        skippedH1 = true;
        i += 1;
        continue;
      }
      if (level === 2) {
        lastH2 = text;
        inVerdict = text === "High-Level Verdict";
      }
      const Tag = (level === 1 ? "h1" : level === 2 ? "h2" : "h3") as
        | "h1"
        | "h2"
        | "h3";
      blocks.push(
        <Tag key={key++} className={headingClass(level, text)}>
          {renderInlineMarkdown(text)}
        </Tag>,
      );
      i += 1;
      continue;
    }

    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i += 1;
      }
      blocks.push(
        <NewsMarkdownTable
          key={key++}
          rows={parseMarkdownTable(tableLines)}
          className={newsTableClass(lastH2)}
        />,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items: string[] = [];
      while (
        i < lines.length &&
        (ordered ? /^\d+\.\s+/.test(lines[i]) : /^[-*]\s+/.test(lines[i]))
      ) {
        items.push(lines[i].replace(/^([-*]|\d+\.)\s+/, ""));
        i += 1;
      }
      blocks.push(
        <NewsMarkdownList key={key++} items={items} ordered={ordered} />,
      );
      continue;
    }

    const para: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].trim().startsWith("|") &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^!\[/.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <p
        key={key++}
        className={
          inVerdict ? "post-verdict text-[var(--ink)]" : "text-[var(--ink)]"
        }
      >
        {renderInlineMarkdown(para.join(" "))}
      </p>,
    );
  }

  return <div className="space-y-4">{blocks}</div>;
}
