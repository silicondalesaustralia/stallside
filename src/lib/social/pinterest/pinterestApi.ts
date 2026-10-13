// ============================================================
// lib/social/pinterest/pinterestApi.ts
// Pinterest v5 calls used by Vendl: account, boards, create Pin.
// ============================================================

import {
  PINTEREST_PRODUCTION_API,
  pinterestApiBase,
  pinterestSandboxAccessToken,
} from '@/lib/social/pinterest/pinterestConfig'

export type PinterestAccount = {
  id: string
  username: string
  profileImageUrl: string | null
}

export type PinterestBoard = {
  id: string
  name: string
  privacy: string
}

export type CreatePinInput = {
  boardId: string
  title: string
  description: string
  link: string | null
  imageUrl: string
  altText: string
}

type PinterestTarget = { base: string; accessToken: string }

/** Boards and Pins go to the sandbox (with the sandbox token) while the app is on Trial access. */
function contentTarget(accessToken: string): PinterestTarget {
  const base = pinterestApiBase()
  if (base === PINTEREST_PRODUCTION_API) return { base, accessToken }
  const sandboxToken = pinterestSandboxAccessToken()
  if (!sandboxToken) {
    throw new Error('Pinterest sandbox needs PINTEREST_SANDBOX_ACCESS_TOKEN (from the app page)')
  }
  return { base, accessToken: sandboxToken }
}

async function pinterestRequest<T>(
  target: PinterestTarget,
  path: string,
  init?: { method: 'POST'; body: unknown },
): Promise<T> {
  const { base, accessToken } = target
  const res = await fetch(`${base}/v5${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init ? JSON.stringify(init.body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) {
    let message = `Pinterest request failed (${res.status})`
    try {
      const body = JSON.parse(text) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // Non-JSON error body: keep the status message.
    }
    console.error('[Pinterest] API error', { path, status: res.status, message })
    throw new Error(message)
  }
  return JSON.parse(text) as T
}

export async function getPinterestAccount(accessToken: string): Promise<PinterestAccount> {
  const json = await pinterestRequest<{ id?: string; username?: string; profile_image?: string }>(
    { base: PINTEREST_PRODUCTION_API, accessToken },
    '/user_account',
  )
  const username = json.username ?? 'Pinterest account'
  return { id: json.id ?? username, username, profileImageUrl: json.profile_image ?? null }
}

export async function listPinterestBoards(accessToken: string): Promise<PinterestBoard[]> {
  const json = await pinterestRequest<{ items?: { id: string; name: string; privacy?: string }[] }>(
    contentTarget(accessToken),
    '/boards?page_size=250',
  )
  return (json.items ?? []).map((b) => ({ id: b.id, name: b.name, privacy: b.privacy ?? 'PUBLIC' }))
}

export async function createPinterestPin(accessToken: string, input: CreatePinInput): Promise<string> {
  const json = await pinterestRequest<{ id: string }>(contentTarget(accessToken), '/pins', {
    method: 'POST',
    body: {
      board_id: input.boardId,
      title: input.title,
      description: input.description,
      alt_text: input.altText,
      ...(input.link ? { link: input.link } : {}),
      media_source: { source_type: 'image_url', url: input.imageUrl },
    },
  })
  return json.id
}
