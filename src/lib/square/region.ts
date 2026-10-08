/** Countries Vendl runs a Square app in; app fees need the app and seller in the same country. */
export type SquareRegion = "AU" | "US";

const REGION_CURRENCY: Record<SquareRegion, string> = { AU: "AUD", US: "USD" };

const REGION_LABEL: Record<SquareRegion, string> = {
  AU: "Australia",
  US: "the United States",
};

export function squareRegionCurrency(region: SquareRegion): string {
  return REGION_CURRENCY[region];
}

export function squareRegionLabel(region: SquareRegion): string {
  return REGION_LABEL[region];
}

export function squareRegionForCurrency(
  currency: string | null | undefined,
): SquareRegion | null {
  const raw = (currency ?? "AUD").trim().toUpperCase();
  if (raw === "AUD") return "AU";
  if (raw === "USD") return "US";
  return null;
}

/** Connections made before US support have no country and came from the AU app. */
export function connectionSquareRegion(conn: {
  providerCountry: string | null;
}): SquareRegion {
  return conn.providerCountry?.trim().toUpperCase() === "US" ? "US" : "AU";
}
