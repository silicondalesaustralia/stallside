/**
 * Pinterest connector - run: npx tsx src/lib/social/pinterest/pinterest.test.ts
 */
import assert from 'node:assert/strict'

process.env.PINTEREST_APP_ID = 'test-app'
process.env.PINTEREST_APP_SECRET = 'test-secret'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co'

async function run() {
  const { pinterestTokenNeedsRefresh } = await import('./pinterestAuth')
  const { pinterestTokenColumns, getPinterestOAuthUrl, parsePinterestScopes } = await import('./pinterestOAuth')
  const { encodePinterestOAuthState, decodePinterestOAuthState, peekPinterestReturnPath } = await import(
    './pinterestOAuthState'
  )
  const { sanitizePinterestSettings, pinterestSettingsFromDraft, EMPTY_PINTEREST_DRAFT } = await import(
    './pinterestSettings'
  )
  const { pinterestResultColumns } = await import('./publishPinterestForPost')

  // Token refresh window (24h margin).
  const now = Date.parse('2026-10-13T00:00:00Z')
  assert.equal(pinterestTokenNeedsRefresh(null, now), true)
  assert.equal(pinterestTokenNeedsRefresh(new Date(now + 2 * 86_400_000).toISOString(), now), false)
  assert.equal(pinterestTokenNeedsRefresh(new Date(now + 3_600_000).toISOString(), now), true)

  // Refresh responses may omit refresh_token: keep the stored one.
  const refreshed = pinterestTokenColumns({ access_token: 'a2', expires_in: 3600, scope: 'pins:read,pins:write' }, now)
  assert.equal('pinterest_refresh_token' in refreshed, false)
  assert.equal(refreshed.pinterest_scopes, 'pins:read pins:write')
  assert.deepEqual(parsePinterestScopes('boards:read, pins:write user_accounts:read'), [
    'boards:read',
    'pins:write',
    'user_accounts:read',
  ])

  const url = new URL(getPinterestOAuthUrl('st', 'https://vendl.app/cb'))
  assert.equal(url.searchParams.get('client_id'), 'test-app')
  assert.equal(url.searchParams.get('scope'), 'boards:read,pins:read,pins:write,user_accounts:read')

  // OAuth state round-trip and tamper check.
  const state = encodePinterestOAuthState({ businessId: 'b1', userId: 'u1', returnPath: '/dashboard/connectors' })
  assert.equal(decodePinterestOAuthState(state)?.businessId, 'b1')
  assert.equal(peekPinterestReturnPath(state), '/dashboard/connectors')
  assert.equal(decodePinterestOAuthState(`${state.split('.')[0]}.bad`), null)
  assert.equal(decodePinterestOAuthState(null), null)

  // Settings.
  assert.equal(sanitizePinterestSettings({ boardId: '../x', title: 'Hi' }), null)
  assert.equal(sanitizePinterestSettings({ boardId: '123', title: 'Hi', link: 'javascript:alert(1)' }), null)
  assert.deepEqual(sanitizePinterestSettings({ boardId: '123', boardName: 'B', title: '  Hi  ', link: '' }), {
    boardId: '123',
    boardName: 'B',
    title: 'Hi',
    link: null,
  })
  assert.equal(pinterestSettingsFromDraft(EMPTY_PINTEREST_DRAFT, 'x').blockReason, 'Pick a Pinterest board.')
  const fromCaption = pinterestSettingsFromDraft({ ...EMPTY_PINTEREST_DRAFT, boardId: '9' }, '\nFresh eggs\nmore')
  assert.equal(fromCaption.settings?.title, 'Fresh eggs')
  const badLink = pinterestSettingsFromDraft({ ...EMPTY_PINTEREST_DRAFT, boardId: '9', link: 'ftp://x' }, 'a')
  assert.equal(badLink.settings, null)

  // Result columns.
  assert.deepEqual(pinterestResultColumns(undefined), {})
  assert.deepEqual(pinterestResultColumns({ success: true, postId: 'p1' }), {
    pinterest_post_id: 'p1',
    pinterest_error: null,
  })
  assert.equal(pinterestResultColumns({ success: false, error: 'nope' }).pinterest_error, 'nope')

  console.log('pinterest.test.ts: all assertions passed')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
