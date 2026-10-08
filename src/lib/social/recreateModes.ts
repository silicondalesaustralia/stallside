export const RECREATE_MODES = ['closest', 'fresh_take'] as const

export type RecreateMode = (typeof RECREATE_MODES)[number]

export const RECREATE_MODE_COPY: Record<
  RecreateMode,
  { label: string; description: string }
> = {
  closest: {
    label: 'Closest',
    description: 'Keep the same kind of layout and creative feel, rebuilt for your business.',
  },
  fresh_take: {
    label: 'Fresh take',
    description: 'Keep the energy and style, but create a new composition.',
  },
}

export function isRecreateMode(value: unknown): value is RecreateMode {
  return value === 'closest' || value === 'fresh_take'
}

export function parseRecreateMode(value: unknown): RecreateMode | null {
  return isRecreateMode(value) ? value : null
}
