type Obj = Record<string, unknown>;

function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Trim to max length at a word boundary (models often overrun limits by a few characters). */
function clip(value: unknown, max: number): unknown {
  if (typeof value !== "string" || value.length <= max) return value;
  const cut = value.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:–-]+$/, "");
}

function list(value: unknown, max: number): unknown[] | undefined {
  return Array.isArray(value) ? value.slice(0, max) : undefined;
}

function isWebUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function normalizeNotes(notes: unknown): unknown {
  if (!isObj(notes)) return notes;
  const sources = Array.isArray(notes.sources) ? notes.sources.filter(isObj) : [];
  const web = sources.filter((s) => isWebUrl(s.url)).map((s) => ({ title: clip(String(s.title ?? s.url), 300), url: s.url }));
  const other = sources.filter((s) => !isWebUrl(s.url)).map((s) => `[source] ${String(s.title ?? "")} (${String(s.url ?? "")})`);
  const factChecks = [...(Array.isArray(notes.factChecks) ? notes.factChecks : []), ...other];
  return {
    ...notes,
    whyThisTopic: clip(notes.whyThisTopic, 3000),
    sources: web.slice(0, 40),
    factChecks: factChecks.slice(0, 40).map((f) => clip(f, 500)),
    internalLinks: list(notes.internalLinks, 40)?.map((l) => clip(l, 300)),
  };
}

function normalizeImage(image: unknown): unknown {
  if (!isObj(image)) return image;
  return { ...image, alt: clip(image.alt, 200), caption: clip(image.caption, 200), prompt: clip(image.prompt, 1500) };
}

/** Fix over-length fields and non-URL sources before validation instead of discarding a long research run. */
export function normalizeArticle(raw: unknown): unknown {
  if (!isObj(raw)) return raw;
  const images = isObj(raw.images) ? raw.images : {};
  return {
    ...raw,
    title: clip(raw.title, 160),
    seoTitle: clip(raw.seoTitle, 70),
    seoDescription: clip(raw.seoDescription, 170),
    excerpt: clip(raw.excerpt, 400),
    keywords: clip(raw.keywords, 400),
    agentSummary: clip(raw.agentSummary, 2000),
    faqs: list(raw.faqs, 12),
    targetQueries: list(raw.targetQueries, 30),
    changeNotes: list(raw.changeNotes, 30),
    researchNotes: normalizeNotes(raw.researchNotes),
    images: {
      ...images,
      hero: normalizeImage(images.hero),
      inline: list(images.inline, 3)?.map(normalizeImage),
    },
  };
}
