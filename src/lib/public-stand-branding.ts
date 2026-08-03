/** Public stall uses saved branding on all plans (Free and Pro). */
export function publicStandBranding<T extends {
  logoUrl: string | null;
  accentColor: string | null;
  secondaryColor: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  websiteUrl?: string | null;
}>(stand: T, _owner?: unknown): T {
  return stand;
}
