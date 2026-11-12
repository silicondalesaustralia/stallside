import {
  COMPOSER_DRAFT_MAX_BYTES,
  composerDraftIsEmpty,
  parseComposerDraft,
  type ComposerDraftData,
} from '@/lib/tradiespost/composer/composerDraft'

/** Body of POST /api/social/drafts and PUT /api/social/drafts/[id]: `{ draft }`. */
export function parseDraftRequestBody(body: unknown): { ok: true; draft: ComposerDraftData } | { ok: false; message: string } {
  const raw = body && typeof body === 'object' ? (body as Record<string, unknown>).draft : undefined
  if (JSON.stringify(raw ?? null).length > COMPOSER_DRAFT_MAX_BYTES) {
    return { ok: false, message: 'This draft is too large to save.' }
  }
  const draft = parseComposerDraft(raw)
  if (!draft) return { ok: false, message: 'Invalid draft.' }
  if (composerDraftIsEmpty(draft)) return { ok: false, message: 'Add a caption, image, video or slideshow before saving a draft.' }
  return { ok: true, draft }
}
