'use client'

import { useEffect, useState } from 'react'
import type { PinterestBoard } from '@/lib/social/pinterest/pinterestApi'
import {
  EMPTY_PINTEREST_DRAFT,
  pinterestSettingsFromDraft,
  type PinterestSettingsDraft,
} from '@/lib/social/pinterest/pinterestSettings'

const LAST_BOARD_KEY = 'vendl.pinterest.lastBoardId'

function rememberedBoardId(): string | null {
  try {
    return window.localStorage.getItem(LAST_BOARD_KEY)
  } catch {
    return null
  }
}

export function rememberPinterestBoard(boardId: string) {
  try {
    window.localStorage.setItem(LAST_BOARD_KEY, boardId)
  } catch {
    // Private mode or storage disabled: the picker just won't preselect next time.
  }
}

/** Board list, board/title/link draft, and the derived settings payload + block reason for submit. */
export function useComposerPinterestGate(active: boolean, caption: string) {
  const [draft, setDraft] = useState<PinterestSettingsDraft>(EMPTY_PINTEREST_DRAFT)
  const [boards, setBoards] = useState<PinterestBoard[] | null>(null)
  const [boardsError, setBoardsError] = useState<string | null>(null)

  useEffect(() => {
    if (!active || boards) return
    let cancelled = false
    async function loadBoards() {
      try {
        const res = await fetch('/api/social/connect/pinterest/boards')
        const json = (await res.json().catch(() => ({}))) as { boards?: PinterestBoard[]; error?: string }
        if (!res.ok) throw new Error(json.error || `Could not load boards (${res.status})`)
        if (cancelled) return
        const list = json.boards ?? []
        setBoards(list)
        setBoardsError(null)
        const remembered = list.find((b) => b.id === rememberedBoardId()) ?? (list.length === 1 ? list[0] : null)
        if (remembered) {
          setDraft((prev) => (prev.boardId ? prev : { ...prev, boardId: remembered.id, boardName: remembered.name }))
        }
      } catch (err) {
        console.error('[Pinterest boards]', err)
        if (!cancelled) setBoardsError(err instanceof Error ? err.message : 'Could not load Pinterest boards')
      }
    }
    void loadBoards()
    return () => {
      cancelled = true
    }
  }, [active, boards])

  const derived = active ? pinterestSettingsFromDraft(draft, caption) : { settings: null, blockReason: null }
  return {
    draft,
    setDraft,
    active,
    boards,
    boardsError,
    settings: derived.settings,
    blockReason: derived.blockReason,
  }
}

export type ComposerPinterestState = ReturnType<typeof useComposerPinterestGate>
