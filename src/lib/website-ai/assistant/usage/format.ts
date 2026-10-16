function money(amount: number, symbol: string): string {
  if (amount === 0) return `${symbol}0.00`;
  if (amount < 0.01) return `<${symbol}0.01`;
  return `${symbol}${amount.toFixed(2)}`;
}

/** e.g. "US$0.42 (A$0.64)". `audPerUsd` comes from the admin FX rates. */
export function formatUsdMicros(micros: number | null, audPerUsd: number | undefined): string {
  if (micros === null) return "Unknown";
  const usd = micros / 1_000_000;
  const aud = audPerUsd && audPerUsd > 0 ? ` (${money(usd * audPerUsd, "A$")})` : "";
  return `${money(usd, "US$")}${aud}`;
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  return n.toLocaleString("en-AU");
}

export const FEATURE_LABELS: Record<string, string> = {
  website_build: "Website builds",
  website_followups: "Follow-up questions",
  website_import: "Website import",
  website_image: "Decorative images",
};
