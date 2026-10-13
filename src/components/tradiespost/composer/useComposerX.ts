'use client'

import { useCallback, useState } from 'react'
import { defaultXText, xTextBlockReason } from '@/lib/social/x/xText'

/** X post text: follows the caption (trimmed to fit) until the seller edits it. */
export function useComposerXGate(active: boolean, caption: string) {
  const [draft, setDraft] = useState('')
  const [touched, setTouched] = useState(false)

  const text = touched ? draft : defaultXText(caption)
  const setText = useCallback((value: string) => {
    setTouched(true)
    setDraft(value)
  }, [])
  const resetText = useCallback(() => {
    setTouched(false)
    setDraft('')
  }, [])

  return {
    active,
    text,
    setText,
    touched,
    resetText,
    settings: active ? text.trim() : null,
    blockReason: active ? xTextBlockReason(text) : null,
  }
}

export type ComposerXState = ReturnType<typeof useComposerXGate>
