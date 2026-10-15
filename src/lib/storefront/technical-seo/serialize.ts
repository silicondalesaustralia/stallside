import type { MetadataRoute } from "next";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** sitemaps.org XML for a store sitemap. */
export function sitemapXml(entries: MetadataRoute.Sitemap): string {
  const urls = entries.map((e) => {
    const parts = [`<loc>${escapeXml(e.url)}</loc>`];
    if (e.lastModified) {
      const date = e.lastModified instanceof Date ? e.lastModified : new Date(e.lastModified);
      if (!Number.isNaN(date.getTime())) parts.push(`<lastmod>${date.toISOString()}</lastmod>`);
    }
    if (e.changeFrequency) parts.push(`<changefreq>${e.changeFrequency}</changefreq>`);
    if (e.priority !== undefined) parts.push(`<priority>${e.priority}</priority>`);
    return `<url>${parts.join("")}</url>`;
  });
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

/** robots.txt for one user-agent group plus an optional sitemap line. */
export function robotsTxt(input: { allow?: string[]; disallow: string[]; sitemap?: string }): string {
  const lines = ["User-agent: *"];
  for (const path of input.allow ?? []) lines.push(`Allow: ${path}`);
  for (const path of input.disallow) lines.push(`Disallow: ${path}`);
  if (input.sitemap) lines.push("", `Sitemap: ${input.sitemap}`);
  return `${lines.join("\n")}\n`;
}
