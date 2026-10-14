export const SHIPPING_CARRIERS: { name: string; trackUrl: ((n: string) => string) | null }[] = [
  { name: "Australia Post", trackUrl: (n) => `https://auspost.com.au/mypost/track/details/${n}` },
  { name: "StarTrack", trackUrl: (n) => `https://startrack.com.au/track/details/${n}` },
  { name: "Sendle", trackUrl: (n) => `https://track.sendle.com/tracking?ref=${n}` },
  { name: "Aramex", trackUrl: (n) => `https://www.aramex.com.au/tools/track?l=${n}` },
  { name: "CouriersPlease", trackUrl: (n) => `https://www.couriersplease.com.au/tools-track/no/${n}` },
  { name: "DHL", trackUrl: (n) => `https://www.dhl.com/au-en/home/tracking.html?tracking-id=${n}` },
  { name: "Other", trackUrl: null },
];

/** The seller's link if given (http/https only), else the carrier's tracking page for the number. */
export function resolveTrackingUrl(carrier: string, trackingNumber: string, url: string): string | null {
  const given = url.trim();
  if (given) return /^https?:\/\//i.test(given) ? given : null;
  const known = SHIPPING_CARRIERS.find((c) => c.name === carrier);
  const number = trackingNumber.trim();
  return known?.trackUrl && number ? known.trackUrl(encodeURIComponent(number)) : null;
}
