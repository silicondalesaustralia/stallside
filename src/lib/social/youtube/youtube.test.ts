/**
 * YouTube connector - run: npx tsx src/lib/social/youtube/youtube.test.ts
 */
import assert from 'node:assert/strict'

process.env.GOOGLE_YOUTUBE_CLIENT_ID = 'test-client'
process.env.GOOGLE_YOUTUBE_CLIENT_SECRET = 'test-secret'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co'

async function run() {
  const { youtubeTokenNeedsRefresh } = await import('./youtubeAuth')
  const { youtubeTokenColumns, getYouTubeOAuthUrl } = await import('./youtubeOAuth')
  const { encodeYouTubeOAuthState, decodeYouTubeOAuthState, peekYouTubeReturnPath } = await import(
    './youtubeOAuthState'
  )
  const { youtubeConnectErrorMessage } = await import('./youtubeConnectErrors')

  // Token refresh window.
  const now = Date.parse('2026-10-12T00:00:00Z')
  assert.equal(youtubeTokenNeedsRefresh(null, now), true)
  assert.equal(youtubeTokenNeedsRefresh('not-a-date', now), true)
  assert.equal(youtubeTokenNeedsRefresh(new Date(now + 60 * 60 * 1000).toISOString(), now), false)
  assert.equal(youtubeTokenNeedsRefresh(new Date(now + 60 * 1000).toISOString(), now), true)

  // Google omits refresh_token on refresh - the stored one must be kept.
  const refreshed = youtubeTokenColumns({ access_token: 'a2', expires_in: 3599, scope: 's' }, now)
  assert.equal('youtube_refresh_token' in refreshed, false)
  assert.equal(refreshed.youtube_token_expires_at, new Date(now + 3599 * 1000).toISOString())
  const first = youtubeTokenColumns({ access_token: 'a1', expires_in: 3599, scope: 's', refresh_token: 'r1' }, now)
  assert.equal(first.youtube_refresh_token, 'r1')

  // Authorize URL requests offline access so a refresh token is issued.
  const url = new URL(getYouTubeOAuthUrl('st', 'https://www.vendl.app/api/social/connect/youtube/callback'))
  assert.equal(url.searchParams.get('access_type'), 'offline')
  assert.equal(url.searchParams.get('prompt'), 'consent')
  assert.match(url.searchParams.get('scope') ?? '', /youtube\.upload/)

  // Signed state round-trip, tamper rejection, and unsigned return-path peek.
  const state = encodeYouTubeOAuthState({ businessId: 'b1', userId: 'u1', returnPath: '/connections' })
  assert.equal(decodeYouTubeOAuthState(state)?.businessId, 'b1')
  assert.equal(decodeYouTubeOAuthState(`${state}x`), null)
  assert.equal(decodeYouTubeOAuthState(null), null)
  assert.equal(peekYouTubeReturnPath(state), '/connections')

  assert.match(youtubeConnectErrorMessage('no_channel'), /no YouTube channel/)
  assert.match(youtubeConnectErrorMessage('weird'), /\(weird\)/)

  console.log('youtube.test.ts: all assertions passed')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
