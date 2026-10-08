import type { RecreateMessageAngle } from '@/lib/social/recreateMessageAngles'
import type { RecreateLogoPosition, RecreateLogoSize } from '@/lib/social/recreateLogoPlacement'
import type { AiDesignedIntentId } from '@/lib/social/designedIntents'
import { AI_DESIGNED_VISUAL_PATH } from '@/lib/social/aiDesignedConfig'
import type { DesignedVisualAuditEntry } from '@/lib/social/designedVisualInputs'

export type DesignedVariantPreview = {
  id: string
  label: string
  imageUrl: string
  visualPath: typeof AI_DESIGNED_VISUAL_PATH
  messageAngle: RecreateMessageAngle
  userBrief: string | null
  intentChip: AiDesignedIntentId | null
  jobId: string | null
  imageModel: string | null
  estimatedUsd: number | null
  latencyMs: number | null
  baseStoragePath: string
  logoAssetId: string | null
  logoVariantType: string | null
  logoDisabled: boolean
  logoPosition: RecreateLogoPosition
  logoSize: RecreateLogoSize
  generationMode: 'ai_designed'
  generationSource: 'ai_designed_scratch'
  visualInputs?: DesignedVisualAuditEntry[]
}
