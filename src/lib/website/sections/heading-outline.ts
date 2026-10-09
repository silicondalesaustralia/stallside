import { defaultHeadingTag, parseSectionStyle } from "./section-style";

/** How many sections on a page render their main heading as an H1. */
export function countPageH1(sections: { craftName: string; style: unknown }[]): number {
  return sections.filter(
    (s) => (parseSectionStyle(s.style).headingTag ?? defaultHeadingTag(s.craftName)) === "h1",
  ).length;
}

export function h1Warning(count: number): string | null {
  if (count === 0) {
    return "This page has no H1. Make your main heading H1 so search engines know the page's title.";
  }
  if (count > 1) {
    return `This page has ${count} H1 headings. Search engines work best with one; use H2 for the others.`;
  }
  return null;
}
