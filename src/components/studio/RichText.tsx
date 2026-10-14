import type { ReactNode } from "react";
import { parseRichText, type RichInline } from "@/lib/website/rich-text/parse";

const LINK = "underline underline-offset-2 hover:opacity-80";

function renderInline(nodes: RichInline[], key = ""): ReactNode[] {
  return nodes.map((n, i) => {
    const k = `${key}${i}`;
    if (n.t === "text") return n.v;
    if (n.t === "br") return <br key={k} />;
    if (n.t === "b") return <strong key={k}>{renderInline(n.c, `${k}-`)}</strong>;
    if (n.t === "i") return <em key={k}>{renderInline(n.c, `${k}-`)}</em>;
    const external = /^https?:\/\//i.test(n.href);
    return (
      <a
        key={k}
        href={n.href}
        className={LINK}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {renderInline(n.c, `${k}-`)}
      </a>
    );
  });
}

/** Section body text with its bold, italic, links and lists. Renders React elements only, never raw HTML. */
export default function RichText({ value, className = "" }: { value: string; className?: string }) {
  const blocks = parseRichText(value);
  if (blocks.length === 0) return null;
  return (
    <div className={`studio-rich-text ${className}`.trim()}>
      {blocks.map((b, i) =>
        b.t === "p" ? (
          <p key={i}>{renderInline(b.c, `${i}-`)}</p>
        ) : b.t === "ul" ? (
          <ul key={i}>
            {b.items.map((item, j) => (
              <li key={j}>{renderInline(item, `${i}-${j}-`)}</li>
            ))}
          </ul>
        ) : (
          <ol key={i}>
            {b.items.map((item, j) => (
              <li key={j}>{renderInline(item, `${i}-${j}-`)}</li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}
