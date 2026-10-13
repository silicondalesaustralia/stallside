/**
 * X connector - run: npx tsx src/lib/social/x/x.test.ts
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

process.env.X_CLIENT_ID = 'test-client'
process.env.X_CLIENT_SECRET = 'test-secret'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co'

async function run() {
  const { xTokenNeedsRefresh } = await import('./xAuth')
  const { createXPkcePair, getXOAuthUrl, xTokenColumns } = await import('./xOAuth')
  const { encodeXOAuthState, decodeXOAuthState, peekXReturnPath } = await import('./xOAuthState')
  const { X_TEXT_MAX, defaultXText, xTextBlockReason, xTextLength } = await import('./xText')
  const { xResultColumns } = await import('./publishXForPost')
  const { directPostUrl } = await import('../postLinks')
  const { composerPostColumns } = await import('../composerPostFields')

  // Access tokens last ~2h: refresh inside a 5 minute margin.
  const now = Date.parse('2026-10-13T00:00:00Z')
  assert.equal(xTokenNeedsRefresh(null, now), true)
  assert.equal(xTokenNeedsRefresh(new Date(now + 3_600_000).toISOString(), now), false)
  assert.equal(xTokenNeedsRefresh(new Date(now + 60_000).toISOString(), now), true)

  // X rotates refresh tokens; keep the stored one only when none comes back.
  const rotated = xTokenColumns({ access_token: 'a', refresh_token: 'r2', expires_in: 7200, scope: 'tweet.read tweet.write' }, now)
  assert.equal(rotated.x_refresh_token, 'r2')
  assert.equal(rotated.x_token_expires_at, new Date(now + 7_200_000).toISOString())
  assert.equal('x_refresh_token' in xTokenColumns({ access_token: 'a', expires_in: 7200, scope: '' }, now), false)

  // PKCE S256 + authorize URL.
  const { verifier, challenge } = createXPkcePair()
  assert.equal(createHash('sha256').update(verifier).digest('base64url'), challenge)
  const url = new URL(getXOAuthUrl('st', 'https://www.vendl.app/api/social/connect/x/callback', challenge))
  assert.equal(url.origin + url.pathname, 'https://x.com/i/oauth2/authorize')
  assert.equal(url.searchParams.get('client_id'), 'test-client')
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256')
  assert.match(url.searchParams.get('scope') ?? '', /tweet\.write.*media\.write.*offline\.access/)

  // Signed state round trip; tampering is rejected.
  const state = encodeXOAuthState({ businessId: 'b1', userId: 'u1', returnPath: '/dashboard/social/connections' })
  assert.equal(decodeXOAuthState(state)?.businessId, 'b1')
  assert.equal(peekXReturnPath(state), '/dashboard/social/connections')
  assert.equal(decodeXOAuthState(`${state}x`), null)
  assert.equal(decodeXOAuthState(null), null)

  // Text length: links count as 23, emoji as 2.
  assert.equal(xTextLength('hi https://www.vendl.app/s/some-very-long-stand-slug/product'), 3 + 23)
  assert.equal(xTextLength('🍓'), 2)
  assert.equal(defaultXText('  Fresh eggs today  '), 'Fresh eggs today')
  const long = Array.from({ length: 80 }, (_, i) => `word${i}`).join(' ')
  const trimmed = defaultXText(long)
  assert.ok(xTextLength(trimmed) <= X_TEXT_MAX)
  assert.ok(trimmed.endsWith('…'))
  assert.equal(xTextBlockReason(trimmed), null)
  assert.equal(xTextBlockReason('   '), 'Write the text for X.')
  assert.match(xTextBlockReason(long) ?? '', /280/)

  // Result columns.
  assert.deepEqual(xResultColumns(undefined), {})
  assert.deepEqual(xResultColumns({ success: true, postId: '123' }), { x_post_id: '123', x_error: null })
  assert.deepEqual(xResultColumns({ success: false, error: 'nope' }), { x_post_id: null, x_error: 'nope' })
  assert.equal(directPostUrl('x', '1850000000000000000'), 'https://x.com/i/web/status/1850000000000000000')

  // Save-time check uses platformCaptions.x, else the caption.
  const base = { platforms: ['x'], publishingMode: 'automatic' }
  assert.equal(composerPostColumns({ ...base, caption: long }).ok, false)
  assert.equal(composerPostColumns({ ...base, caption: long, platformCaptions: { x: trimmed } }).ok, true)
  assert.equal(composerPostColumns({ ...base, publishingMode: 'manual', caption: long }).ok, true)

  console.log('x.test.ts: all passed')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
