const MIN_HEADINGS_FOR_SPLIT = 3;

/** Split article HTML just before its middle h2 so a call to action can sit between sections. */
export function splitAtMiddleHeading(html: string): [string, string] | null {
  const starts = [...html.matchAll(/<h2[\s>]/gi)].map((match) => match.index ?? -1).filter((index) => index > 0);
  if (starts.length < MIN_HEADINGS_FOR_SPLIT) return null;
  const at = starts[Math.floor(starts.length / 2)];
  return [html.slice(0, at), html.slice(at)];
}
