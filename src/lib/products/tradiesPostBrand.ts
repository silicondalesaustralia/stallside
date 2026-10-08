export const TRADIESPOST_BRAND_FIELDS = [
  'name',
  'website',
  'brand_color',
  'brand_text_color',
  'ai_agent_services',
  'address',
  'phone',
] as const

export type TradiesPostBrandField = (typeof TRADIESPOST_BRAND_FIELDS)[number]

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/

function asOptionalString(value: unknown, max = 500): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

export function pickTradiesPostBrandPatch(
  body: Record<string, unknown>,
): Partial<Record<TradiesPostBrandField, string | null>> {
  const patch: Partial<Record<TradiesPostBrandField, string | null>> = {}

  const name = asOptionalString(body.name, 120)
  if (name !== undefined) patch.name = name

  const website = asOptionalString(body.website, 300)
  if (website !== undefined) patch.website = website

  const services = asOptionalString(body.ai_agent_services, 4000)
  if (services !== undefined) patch.ai_agent_services = services

  const address = asOptionalString(body.address, 300)
  if (address !== undefined) patch.address = address

  const phone = asOptionalString(body.phone, 40)
  if (phone !== undefined) patch.phone = phone

  if (typeof body.brand_color === 'string' && HEX_COLOR.test(body.brand_color)) {
    patch.brand_color = body.brand_color
  } else if (body.brand_color === null) {
    patch.brand_color = null
  }

  if (typeof body.brand_text_color === 'string' && HEX_COLOR.test(body.brand_text_color)) {
    patch.brand_text_color = body.brand_text_color
  } else if (body.brand_text_color === null) {
    patch.brand_text_color = null
  }

  return patch
}

export function pendingInviteCountsTowardSeat(
  invite: { status?: string | null; expires_at?: string | null },
  nowIso: string = new Date().toISOString(),
): boolean {
  return invite.status === 'pending' && typeof invite.expires_at === 'string' && invite.expires_at > nowIso
}
