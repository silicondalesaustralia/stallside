/** Owner.betaFeatures entry that sends an owner to the beta app. */
export const BETA_APP_ACCESS = "beta";

/** Pages beta owners keep using here: Square only accepts this app's OAuth callback. */
const STAY_ON_MAIN_PREFIXES = ["/dashboard/settings/square"];

/** Beta app origin; unset (or not https) turns the hand-off off for everyone. */
export function betaAppUrl(): string | null {
  const raw = process.env.BETA_APP_URL?.trim().replace(/\/$/, "");
  return raw?.startsWith("https://") ? raw : null;
}

export function shouldHandOffToBeta(input: {
  betaFeatures: string[];
  impersonated: boolean;
  pathname: string;
}): boolean {
  if (!betaAppUrl() || input.impersonated) return false;
  if (!input.betaFeatures.includes(BETA_APP_ACCESS)) return false;
  return !STAY_ON_MAIN_PREFIXES.some((p) => input.pathname.startsWith(p));
}
