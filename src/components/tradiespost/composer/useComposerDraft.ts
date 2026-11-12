'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  composerDraftIsEmpty,
  parseComposerDraft,
  type ComposerDraftData,
} from '@/lib/tradiespost/composer/composerDraft'
import { deleteSavedDraft, loadSavedDraft, saveDraft } from '@/components/tradiespost/composer/composerDraftApi'

const LOCAL_PREFIX = 'vendl:composer-draft:'
const AUTOSAVE_MS = 500
/** Links that start a specific post; an old unsaved draft must not replace them. */
const FRESH_START_PARAMS = ['fromPost', 'videoAssetId', 'jobId']

type LocalEntry = { draftId: string | null; data: ComposerDraftData }

function readLocal(key: string): LocalEntry | null {
  try {
    const raw = JSON.parse(window.localStorage.getItem(key) ?? 'null') as { draftId?: unknown; data?: unknown } | null
    const data = parseComposerDraft(raw?.data)
    if (!data) return null
    return { draftId: typeof raw?.draftId === 'string' ? raw.draftId : null, data }
  } catch {
    return null
  }
}

function removeLocal(key: string | null) {
  if (!key) return
  try {
    window.localStorage.removeItem(key)
  } catch (err) {
    console.warn('[Composer] could not clear the autosaved draft', err)
  }
}

/** Autosave to this browser + optional server "Save draft". `apply` must be stable. */
export function useComposerDraft(params: {
  businessId: string | null
  snapshot: ComposerDraftData
  apply: (draft: ComposerDraftData) => void
}) {
  const { businessId, snapshot, apply } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const key = businessId ? `${LOCAL_PREFIX}${businessId}` : null
  const startedRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [restored, setRestored] = useState<'local' | 'saved' | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!key || startedRef.current) return
    startedRef.current = true
    const param = searchParams.get('draft')
    const fresh = FRESH_START_PARAMS.some((p) => searchParams.get(p))
    const restore = async () => {
      const local = readLocal(key)
      if (param) {
        const data = local?.draftId === param ? local.data : (await loadSavedDraft(param)).draft
        apply(data)
        setDraftId(param)
        setRestored('saved')
      } else if (!fresh && local && !composerDraftIsEmpty(local.data)) {
        apply(local.data)
        setDraftId(local.draftId)
        setRestored('local')
      }
    }
    restore()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not open the draft'))
      .finally(() => setReady(true))
  }, [key, searchParams, apply])

  const serialized = JSON.stringify(snapshot)
  useEffect(() => {
    if (!ready || !key) return
    const timer = setTimeout(() => {
      try {
        const data = JSON.parse(serialized) as ComposerDraftData
        if (composerDraftIsEmpty(data) && !draftId) window.localStorage.removeItem(key)
        else window.localStorage.setItem(key, JSON.stringify({ draftId, data }))
      } catch (err) {
        console.warn('[Composer] autosave failed', err)
      }
    }, AUTOSAVE_MS)
    return () => clearTimeout(timer)
  }, [ready, key, serialized, draftId])

  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const result = await saveDraft(draftId, JSON.parse(serialized) as ComposerDraftData)
      setDraftId(result.id)
      setSavedAt(result.updatedAt)
      if (!draftId) router.replace(`/dashboard/social/create?draft=${result.id}`, { scroll: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the draft')
    } finally {
      setSaving(false)
    }
  }, [draftId, serialized, router])

  /** After posting or scheduling: the work is done, so drop both copies. */
  const finish = useCallback(() => {
    removeLocal(key)
    if (draftId) {
      deleteSavedDraft(draftId).catch((err: unknown) => console.warn('[Composer] could not delete the saved draft', err))
    }
  }, [key, draftId])

  const startFresh = useCallback(
    (empty: ComposerDraftData) => {
      removeLocal(key)
      apply(empty)
      setDraftId(null)
      setRestored(null)
      setSavedAt(null)
      setError(null)
      router.replace('/dashboard/social/create', { scroll: false })
    },
    [key, apply, router],
  )

  return { draftId, restored, saving, savedAt, error, save, finish, startFresh, dismiss: () => setRestored(null) }
}
