export const DESIGNED_MAX_VISUALS = 4
export const DESIGNED_MAX_EDIT_IMAGES = 4
export const DESIGNED_VISUAL_MAX_BYTES = 4 * 1024 * 1024

export const DESIGNED_VISUAL_SOURCES = ['upload', 'library', 'job_photo'] as const
export const DESIGNED_VISUAL_ROLES = ['include', 'inspiration'] as const

export type DesignedVisualSource = (typeof DESIGNED_VISUAL_SOURCES)[number]
export type DesignedVisualRole = (typeof DESIGNED_VISUAL_ROLES)[number]

export type DesignedVisualInput = {
  source: DesignedVisualSource
  role: DesignedVisualRole
  isPrimary: boolean
  storagePath?: string
  libraryRenderId?: string
  jobId?: string
  photoId?: string
}

export type DesignedResolvedVisual = DesignedVisualInput & {
  buffer: Buffer
  mimeType: string
  label: string
}

export type ParseDesignedVisualsResult =
  | { ok: true; inputs: DesignedVisualInput[] }
  | { ok: false; error: string; code: 'invalid_visual' | 'too_many_visuals' | 'external_url' }

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

function isSource(value: unknown): value is DesignedVisualSource {
  return typeof value === 'string' && (DESIGNED_VISUAL_SOURCES as readonly string[]).includes(value)
}

function isRole(value: unknown): value is DesignedVisualRole {
  return typeof value === 'string' && (DESIGNED_VISUAL_ROLES as readonly string[]).includes(value)
}

export function parseDesignedVisualInputs(raw: unknown): ParseDesignedVisualsResult {
  if (raw == null) return { ok: true, inputs: [] }
  if (!Array.isArray(raw)) {
    return { ok: false, error: 'Visuals must be a list.', code: 'invalid_visual' }
  }
  if (raw.length > DESIGNED_MAX_VISUALS) {
    return {
      ok: false,
      error: `You can add up to ${DESIGNED_MAX_VISUALS} visuals.`,
      code: 'too_many_visuals',
    }
  }

  const inputs: DesignedVisualInput[] = []
  for (let i = 0; i < raw.length; i += 1) {
    const row = raw[i]
    const indexLabel = `Visual ${i + 1}`
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      return { ok: false, error: `${indexLabel} is invalid.`, code: 'invalid_visual' }
    }
    const rec = row as Record<string, unknown>
    if (typeof rec.url === 'string' && rec.url.trim()) {
      return {
        ok: false,
        error: `${indexLabel}: choose an upload, library image, or job photo. External URLs are not accepted.`,
        code: 'external_url',
      }
    }
    if (!isSource(rec.source)) {
      return { ok: false, error: `${indexLabel}: unknown source.`, code: 'invalid_visual' }
    }
    if (!isRole(rec.role)) {
      return { ok: false, error: `${indexLabel}: choose Include in design or Use as inspiration.`, code: 'invalid_visual' }
    }

    if (rec.source === 'upload') {
      const storagePath = typeof rec.storagePath === 'string' ? rec.storagePath.trim() : ''
      if (!storagePath) {
        return { ok: false, error: `${indexLabel}: upload is missing.`, code: 'invalid_visual' }
      }
      inputs.push({
        source: 'upload',
        role: rec.role,
        isPrimary: rec.isPrimary === true,
        storagePath,
      })
      continue
    }

    if (rec.source === 'library') {
      const libraryRenderId = typeof rec.libraryRenderId === 'string' ? rec.libraryRenderId.trim() : ''
      if (!isUuid(libraryRenderId)) {
        return { ok: false, error: `${indexLabel}: library image is invalid.`, code: 'invalid_visual' }
      }
      inputs.push({
        source: 'library',
        role: rec.role,
        isPrimary: rec.isPrimary === true,
        libraryRenderId,
      })
      continue
    }

    const jobId = typeof rec.jobId === 'string' ? rec.jobId.trim() : ''
    const photoId = typeof rec.photoId === 'string' ? rec.photoId.trim() : ''
    if (!isUuid(jobId) || !isUuid(photoId)) {
      return { ok: false, error: `${indexLabel}: job photo is invalid.`, code: 'invalid_visual' }
    }
    inputs.push({
      source: 'job_photo',
      role: rec.role,
      isPrimary: rec.isPrimary === true,
      jobId,
      photoId,
    })
  }

  return { ok: true, inputs: normalizeDesignedVisualPrimaries(inputs) }
}

export function normalizeDesignedVisualPrimaries(inputs: DesignedVisualInput[]): DesignedVisualInput[] {
  if (!inputs.length) return []
  const includeIndexes = inputs
    .map((item, index) => (item.role === 'include' ? index : -1))
    .filter((index) => index >= 0)
  if (!includeIndexes.length) {
    return inputs.map((item) => ({ ...item, isPrimary: false }))
  }
  const marked = includeIndexes.find((index) => inputs[index].isPrimary)
  const primaryIndex = marked ?? includeIndexes[0]
  return inputs.map((item, index) => ({ ...item, isPrimary: index === primaryIndex }))
}

export function orderDesignedVisualsForProvider(inputs: DesignedResolvedVisual[]): DesignedResolvedVisual[] {
  const primaryInclude = inputs.find((item) => item.role === 'include' && item.isPrimary)
  const otherIncludes = inputs.filter((item) => item.role === 'include' && item !== primaryInclude)
  const inspiration = inputs.filter((item) => item.role === 'inspiration')
  return [...(primaryInclude ? [primaryInclude] : []), ...otherIncludes, ...inspiration]
    .slice(0, DESIGNED_MAX_EDIT_IMAGES)
}

export function designedVisualPromptLines(inputs: DesignedResolvedVisual[]): string[] {
  if (!inputs.length) return []
  const includeCount = inputs.filter((item) => item.role === 'include').length
  const inspirationCount = inputs.filter((item) => item.role === 'inspiration').length
  const lines = [
    'SUPPLIED VISUALS — these images are attached as native references. Follow the roles exactly.',
    `Priority: 1) primary include  2) other include images  3) inspiration (${includeCount} include, ${inspirationCount} inspiration).`,
  ]

  inputs.forEach((item, index) => {
    const place = index + 1
    const primary = item.isPrimary && item.role === 'include' ? ' PRIMARY' : ''
    if (item.role === 'include') {
      lines.push(
        `INCLUDE ${place}${primary} (${item.label}): Use this supplied image as a real visual element in the finished social design. Preserve the core subject of the photo (installed work, equipment, people, or scene). Build the branded layout around it. Do not treat it as vague style-only inspiration.`,
      )
    } else {
      lines.push(
        `INSPIRATION ${place} (${item.label}): Use this reference to guide style, composition, colour, mood, and layout only. Do not reproduce logos or on-image text from it, and do not require the exact image to appear.`,
      )
    }
  })

  if (includeCount > 1) {
    lines.push(
      'Several include images are attached. Create one coherent layout — do not randomly blend unrelated subjects.',
    )
  }
  return lines
}

export function designedVisualIntentLines(intentChip?: string | null): string[] {
  if (intentChip === 'completed_job') {
    return [
      'Post type hint: completed job. If an include image is attached, prefer it as the real job-photo hero. Do not change the user’s chosen include/inspiration role.',
    ]
  }
  if (intentChip === 'trust_proof') {
    return [
      'Post type hint: trust / proof. Job, team, or customer evidence is useful when include is selected. Do not change the user’s chosen role.',
    ]
  }
  if (intentChip === 'product_equipment') {
    return [
      'Post type hint: product / equipment. An equipment photo can be the featured subject when include is selected. Do not change the user’s chosen role.',
    ]
  }
  if (intentChip === 'offer_promotion') {
    return [
      'Post type hint: offer / promotion. An uploaded visual may be a background or hero when include is selected. Do not change the user’s chosen role.',
    ]
  }
  return []
}

export type DesignedVisualAuditEntry = {
  source: DesignedVisualInput['source']
  role: DesignedVisualInput['role']
  isPrimary: boolean
  storagePath: string | null
  libraryRenderId: string | null
  jobId: string | null
  photoId: string | null
}

export function designedVisualAuditMeta(inputs: DesignedVisualInput[]): DesignedVisualAuditEntry[] {
  return inputs.map((item) => ({
    source: item.source,
    role: item.role,
    isPrimary: item.isPrimary,
    storagePath: item.storagePath ?? null,
    libraryRenderId: item.libraryRenderId ?? null,
    jobId: item.jobId ?? null,
    photoId: item.photoId ?? null,
  }))
}
