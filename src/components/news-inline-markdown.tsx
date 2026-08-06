import type { ReactNode } from "react";

function linkNode(key: number, label: string, href: string) {
  const external = href.startsWith("http");
  return (
    <a
      key={key}
      href={href}
      className="font-semibold text-[var(--leaf-dark)] underline"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {label}
    </a>
  );
}

/** Turn inline markdown (links, bold, code) into React nodes. */
export function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));

    if (match[2] !== undefined) {
      nodes.push(
        <strong key={key++}>{renderInlineMarkdown(match[2])}</strong>,
      );
    } else if (match[3] !== undefined && match[4] !== undefined) {
      nodes.push(linkNode(key++, match[3], match[4]));
    } else if (match[5] !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-[var(--panel)] px-1 font-[family-name:var(--font-mono)] text-sm"
        >
          {match[5]}
        </code>,
      );
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
