import { safeHref } from "./parse";
import { encodeHrefForMarkup, escapeLineStart, escapeRichText } from "./serialize";

const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "SECTION"]);
const BOLD_TAGS = new Set(["B", "STRONG"]);
const ITALIC_TAGS = new Set(["I", "EM"]);

/** Wraps `inner` in a marker, keeping edge spaces outside so `** x**` can't happen. */
function wrap(marker: string, inner: string): string {
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(inner);
  if (!m || !m[2]) return inner;
  return `${m[1]}${marker}${m[2]}${marker}${m[3]}`;
}

function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeRichText((node.textContent ?? "").replace(/\u00a0/g, " ").replace(/\n/g, " "));
  }
  if (!(node instanceof HTMLElement)) return "";
  if (node.tagName === "BR") return "\n";
  const inner = Array.from(node.childNodes).map(inline).join("");
  if (BOLD_TAGS.has(node.tagName)) return wrap("**", inner);
  if (ITALIC_TAGS.has(node.tagName)) return wrap("_", inner);
  if (node.tagName === "A") {
    const href = safeHref(node.getAttribute("href") ?? "");
    const label = inner.trim();
    return href && label ? `[${label}](${encodeHrefForMarkup(href)})` : inner;
  }
  if (node.tagName === "UL" || node.tagName === "OL") return `\n${list(node)}\n`;
  if (BLOCK_TAGS.has(node.tagName) || node.tagName === "LI") return `${inner}\n`;
  return inner;
}

function list(el: HTMLElement): string {
  const numbered = el.tagName === "OL";
  return Array.from(el.children)
    .filter((li) => li.tagName === "LI")
    .map((li, i) => {
      const text = Array.from(li.childNodes).map(inline).join("").replace(/\n+/g, " ").trim();
      return text ? `${numbered ? `${i + 1}.` : "-"} ${text}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

/** Reads the editor's contentEditable back into the stored rich-text format. */
export function domToRichText(root: HTMLElement): string {
  const blocks: string[] = [];
  let paragraph = "";
  const pushParagraph = () => {
    const lines = paragraph.replace(/\n+$/, "").split("\n").map((l) => l.trimEnd());
    if (lines.some((l) => l.trim())) blocks.push(lines.map(escapeLineStart).join("\n"));
    paragraph = "";
  };
  for (const child of Array.from(root.childNodes)) {
    if (child instanceof HTMLElement && (child.tagName === "UL" || child.tagName === "OL")) {
      pushParagraph();
      const items = list(child);
      if (items) blocks.push(items);
    } else if (child instanceof HTMLElement && BLOCK_TAGS.has(child.tagName)) {
      pushParagraph();
      paragraph = Array.from(child.childNodes).map(inline).join("");
      pushParagraph();
    } else {
      paragraph += inline(child);
    }
  }
  pushParagraph();
  return blocks.join("\n\n");
}
