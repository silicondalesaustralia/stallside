export const RECREATE_MESSAGE_ANGLES = [
  'bold_direct',
  'helpful_educational',
  'trust_proof',
] as const

export type RecreateMessageAngle = (typeof RECREATE_MESSAGE_ANGLES)[number]

export const RECREATE_MESSAGE_ANGLE_LABELS: Record<RecreateMessageAngle, string> = {
  bold_direct: 'Bold & direct',
  helpful_educational: 'Helpful & educational',
  trust_proof: 'Trust & proof',
}

export function recreateMessageAngleAt(index: number): RecreateMessageAngle {
  return RECREATE_MESSAGE_ANGLES[index % RECREATE_MESSAGE_ANGLES.length]
}

export function isRecreateMessageAngle(value: unknown): value is RecreateMessageAngle {
  return (
    value === 'bold_direct' ||
    value === 'helpful_educational' ||
    value === 'trust_proof'
  )
}
