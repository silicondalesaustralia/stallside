export type GscRow = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type ApiRow = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number };

const PAGE_SIZE = 25_000;

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** GSC data lags ~2-3 days; end the window 3 days ago so totals are complete. */
export function gscDateWindow(days: number, now = new Date()) {
  const end = new Date(now.getTime() - 3 * 86_400_000);
  const start = new Date(end.getTime() - (days - 1) * 86_400_000);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

/** All query+page rows for the window (paginated). */
export async function fetchQueryPageRows(
  accessToken: string,
  siteUrl: string,
  window: { startDate: string; endDate: string },
): Promise<GscRow[]> {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const rows: GscRow[] = [];

  for (let startRow = 0; startRow < 200_000; startRow += PAGE_SIZE) {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...window,
        dimensions: ["query", "page"],
        rowLimit: PAGE_SIZE,
        startRow,
        dataState: "final",
      }),
    });
    if (!res.ok) {
      throw new Error(`Search Console query failed (${res.status}): ${await res.text()}`);
    }
    const body = (await res.json()) as { rows?: ApiRow[] };
    const page = body.rows ?? [];
    for (const row of page) {
      const [query, pageUrl] = row.keys ?? [];
      if (!query || !pageUrl) continue;
      rows.push({
        query,
        page: pageUrl,
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: row.position ?? 0,
      });
    }
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}
