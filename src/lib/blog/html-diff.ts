export type BlogDiffPart = {
  kind: "same" | "added" | "removed";
  html: string;
};

const VOID = /^(br|hr|img)$/i;

/** Split HTML into top-level blocks (paragraphs, headings, lists, tables…). */
export function splitHtmlBlocks(html: string): string[] {
  const blocks: string[] = [];
  const tagRe = /<\/?([a-z][a-z0-9]*)[^>]*?(\/?)>/gi;
  let depth = 0;
  let start = 0;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRe.exec(html))) {
    const [full, name, selfClose] = match;
    const closing = full.startsWith("</");
    const isVoid = VOID.test(name) || selfClose === "/";

    if (depth === 0 && !closing) {
      const loose = html.slice(cursor, match.index).trim();
      if (loose) blocks.push(`<p>${loose}</p>`);
      start = match.index;
    }

    if (closing) depth = Math.max(0, depth - 1);
    else if (!isVoid) depth += 1;

    if (depth === 0) {
      const block = html.slice(start, match.index + full.length).trim();
      if (block) blocks.push(block);
      cursor = match.index + full.length;
    }
  }

  const tail = html.slice(cursor).trim();
  if (tail) blocks.push(depth === 0 ? `<p>${tail}</p>` : html.slice(start).trim());
  return blocks;
}

function normalizeBlock(block: string): string {
  return block.replace(/\s+/g, " ").replace(/&nbsp;/g, " ").trim().toLowerCase();
}

/** Block-level LCS diff. Changed blocks appear as removed then added. */
export function diffHtmlBlocks(baseHtml: string, nextHtml: string): BlogDiffPart[] {
  const a = splitHtmlBlocks(baseHtml);
  const b = splitHtmlBlocks(nextHtml);
  const na = a.map(normalizeBlock);
  const nb = b.map(normalizeBlock);
  const table: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );

  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] =
        na[i] === nb[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const parts: BlogDiffPart[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (na[i] === nb[j]) {
      parts.push({ kind: "same", html: b[j] });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      parts.push({ kind: "removed", html: a[i] });
      i += 1;
    } else {
      parts.push({ kind: "added", html: b[j] });
      j += 1;
    }
  }
  while (i < a.length) parts.push({ kind: "removed", html: a[i++] });
  while (j < b.length) parts.push({ kind: "added", html: b[j++] });
  return parts;
}

export function countDiffChanges(parts: BlogDiffPart[]) {
  return {
    added: parts.filter((p) => p.kind === "added").length,
    removed: parts.filter((p) => p.kind === "removed").length,
  };
}
