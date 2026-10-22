/**
 * Beta app: this branch deployed as a second Vercel project (e.g. beta.vendl.app)
 * on the production database. Only owners with the beta flag may use it; main's
 * app at www.vendl.app keeps serving everyone else and runs the shared crons.
 * Edge-safe (used by middleware): no Prisma imports here.
 */
export function isBetaApp(): boolean {
  return process.env.VENDL_BETA_APP === "1";
}

/** Main app origin that non-beta owners, sign-ups and onboarding are sent to. */
export function mainAppUrl(): string {
  return (process.env.VENDL_MAIN_APP_URL?.trim() || "https://www.vendl.app").replace(/\/$/, "");
}

/** Crons only the beta app runs; main's production project runs all the others. */
const BETA_APP_CRONS = new Set([
  "publish-due-social-posts",
  "tiktok-publish-status",
  "process-week-plan-generation",
  "process-website-generation",
  "inspiration-temp-cleanup",
  "media-asset-upload-cleanup",
  "gbp-performance-sync",
  "calendar-sync",
]);

/** Beta app crons that read or write the Social (Supabase) database. */
const SOCIAL_DB_CRONS = new Set([
  "publish-due-social-posts",
  "tiktok-publish-status",
  "process-week-plan-generation",
  "inspiration-temp-cleanup",
  "media-asset-upload-cleanup",
  "gbp-performance-sync",
]);

/**
 * Social is switched on explicitly (SOCIAL_SECTION_LIVE=1) and needs its
 * Supabase project; until then it shows as coming soon.
 */
export function socialLive(): boolean {
  return Boolean(
    process.env.SOCIAL_SECTION_LIVE === "1" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

/**
 * True when a cron request must be skipped: main's app already runs it, or it
 * is a Social cron and Social isn't live on the beta app.
 */
export function betaAppSkipsCron(pathname: string): boolean {
  if (!isBetaApp() || !pathname.startsWith("/api/cron/")) return false;
  const name = pathname.slice("/api/cron/".length).split("/")[0] ?? "";
  if (!BETA_APP_CRONS.has(name)) return true;
  return SOCIAL_DB_CRONS.has(name) && !socialLive();
}

/** Paths that belong to main's app (account creation), redirected from the beta app. */
export function betaAppMainOnlyPath(pathname: string): boolean {
  if (!isBetaApp()) return false;
  return ["/signup", "/onboarding"].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
