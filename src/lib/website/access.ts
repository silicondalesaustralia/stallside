import { isBetaApp } from "@/lib/beta-app";

/**
 * Who sees the Website section.
 *
 * - Production (VERCEL_ENV=production): only owners listed in
 *   WEBSITE_SECTION_OWNER_IDS (comma-separated), unless
 *   WEBSITE_SECTION_ENABLED_FOR_ALL=1.
 * - Beta app (VENDL_BETA_APP=1): everyone, since only beta owners get in.
 * - Preview, staging and local development: everyone.
 *
 * Vercel only applies env changes on the next deploy, so redeploy after
 * editing the list.
 */
function allowlistedOwnerIds(): Set<string> {
  const raw = process.env.WEBSITE_SECTION_OWNER_IDS?.trim() ?? "";
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function websiteSectionEnabledFor(ownerId: string): boolean {
  if (isBetaApp() || process.env.WEBSITE_SECTION_ENABLED_FOR_ALL === "1") return true;
  if (process.env.VERCEL_ENV !== "production") return true;
  return allowlistedOwnerIds().has(ownerId);
}
