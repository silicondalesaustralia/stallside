/** Shared platform dimensions - safe for client components (no resvg/fs). */

export type InfographicPlatformId = 'instagram' | 'facebook' | 'gmb'

export const INFOGRAPHIC_PLATFORM_SIZES: Record<
  InfographicPlatformId,
  { width: number; height: number; label: string }
> = {
  instagram: { width: 1080, height: 1080, label: 'Instagram 1080×1080' },
  facebook:  { width: 1200, height: 630,  label: 'Facebook 1200×630' },
  gmb:       { width: 1080, height: 1350, label: 'GMB 1080×1350' },
}
