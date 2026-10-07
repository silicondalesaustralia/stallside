export type TermsSection = {
  heading: string;
  body: string;
};

/** Split owner terms text into heading + body blocks (blank-line separated). */
export function parseTermsSections(raw: string): TermsSection[] {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const blocks = text.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);
  const sections: TermsSection[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const first = lines[0]?.trim() ?? "";
    const rest = lines.slice(1).join("\n").trim();
    const looksLikeHeading =
      first.length > 0 &&
      first.length <= 80 &&
      !first.startsWith("•") &&
      !first.startsWith("-") &&
      !first.startsWith("*") &&
      !/^\d+\./.test(first);

    if (looksLikeHeading && rest) {
      sections.push({ heading: first, body: rest });
    } else if (looksLikeHeading && !rest) {
      sections.push({ heading: first, body: "" });
    } else {
      sections.push({ heading: "Details", body: block });
    }
  }

  return sections;
}
