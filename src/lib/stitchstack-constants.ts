/** Client-safe Stitchstack constants — do not import Prisma or server libs here. */

/** Public Stitchstack app URL (browser-safe default; server code may override via env). */
export const STITCHSTACK_APP_URL = "https://stitchstack.app";

/** Vendl server route that mints SSO and redirects into Stitchstack. */
export const STITCHSTACK_ANALYTICS_HANDOFF_PATH = "/dashboard/analytics/stitchstack";
