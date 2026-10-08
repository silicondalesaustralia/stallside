// KIT SHIM - canonical host origin (used for the Google Business OAuth redirect URI).
import { hostPublicOrigin } from '@/lib/socialHost/hostConfig'

export function appBaseUrl(): string {
  return hostPublicOrigin()
}
