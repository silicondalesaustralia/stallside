/**
 * YouTube publish - run: npx tsx src/lib/social/youtube/youtubePublish.test.ts
 */
import assert from 'node:assert/strict'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co'

async function run() {
  const s = await import('./youtubeSettings')
  const { youtubeVideoResource } = await import('./youtubeUpload')
  const { youtubeResultColumns, youtubePostSourceFromRow, publishYouTubeForPost } = await import(
    './publishYouTubeForPost'
  )
  const { composerPostColumns } = await import('../composerPostFields')
  const { composerBlockReason } = await import('../../tradiespost/composer/composerState')

  // Titles: angle brackets stripped, whitespace collapsed, 100-char cap, caption fallback.
  assert.equal(s.cleanYouTubeTitle('  New <b>honey</b>\n harvest '), 'New bhoney/b harvest')
  assert.equal(s.cleanYouTubeTitle('x'.repeat(150)).length, 100)
  assert.equal(s.defaultYouTubeTitle('\n\nFirst line here\nsecond'), 'First line here')
  assert.deepEqual(s.youtubeSettingsFromDraft({ title: '', privacy: 'unlisted' }, 'Fresh eggs today\nmore'), {
    title: 'Fresh eggs today',
    privacy: 'unlisted',
  })
  assert.equal(s.youtubeSettingsFromDraft({ title: ' ', privacy: 'public' }, ''), null)
  assert.equal(s.sanitizeYouTubeSettings({ title: 'Ok', privacy: 'friends' }), null)
  assert.equal(s.sanitizeYouTubeSettings({ title: '<>', privacy: 'public' }), null)
  assert.deepEqual(s.sanitizeYouTubeSettings({ title: 'Ok', privacy: 'private' }), { title: 'Ok', privacy: 'private' })

  // videos.insert body.
  const resource = youtubeVideoResource({ title: 'T', privacy: 'public' }, 'Desc <with> tags')
  assert.equal(resource.snippet.description, 'Desc with tags')
  assert.equal(resource.status.privacyStatus, 'public')
  assert.equal(resource.status.selfDeclaredMadeForKids, false)

  // Result columns.
  assert.deepEqual(youtubeResultColumns(undefined), {})
  assert.deepEqual(youtubeResultColumns({ success: true, postId: 'abc' }), { youtube_post_id: 'abc', youtube_error: null })
  assert.deepEqual(youtubeResultColumns({ success: false, error: 'nope' }), { youtube_post_id: null, youtube_error: 'nope' })

  // Publish guards fail before any network call.
  const row = youtubePostSourceFromRow({ id: 'p1', youtube_settings: { title: 'T', privacy: 'public' } })
  const noVideo = await publishYouTubeForPost({ ...row, businessId: 'b1', caption: 'c' })
  assert.equal(noVideo.error, 'YouTube needs a video')
  const offsite = await publishYouTubeForPost({
    ...row, businessId: 'b1', caption: 'c', mediaType: 'video', videoUrl: 'https://evil.example/v.mp4',
  })
  assert.equal(offsite.error, 'Video must come from your Library')

  // Server-side create validation.
  const video = { mediaType: 'video', videoUrl: 'https://abc.supabase.co/storage/v1/v.mp4' }
  const ok = composerPostColumns({ platforms: ['youtube', 'tiktok'], youtubeSettings: { title: 'T', privacy: 'public' }, ...video, tiktokSettings: null, publishingMode: 'manual' })
  assert.equal(ok.ok, true)
  assert.equal(composerPostColumns({ platforms: ['youtube'], ...video }).ok, false)
  assert.equal(composerPostColumns({ platforms: ['youtube'], youtubeSettings: { title: 'T', privacy: 'public' } }).ok, false)
  assert.equal(composerPostColumns({ platforms: ['youtube', 'facebook'], youtubeSettings: { title: 'T', privacy: 'public' }, ...video }).ok, false)

  // Composer gate.
  const connected = { facebook: true, instagram: true, gmb: true, tiktok: true, youtube: true, pinterest: true }
  const base = { mode: 'now' as const, connected, imageUrl: 'x', caption: 'c', date: '' }
  assert.match(composerBlockReason({ ...base, selected: ['youtube'], isVideo: false }) ?? '', /YouTube needs a video/)
  assert.equal(composerBlockReason({ ...base, selected: ['youtube', 'tiktok'], isVideo: true }), null)
  assert.match(composerBlockReason({ ...base, selected: ['youtube', 'facebook'], isVideo: true }) ?? '', /TikTok and YouTube only/)
  assert.equal(composerBlockReason({ ...base, selected: ['youtube'], isVideo: true, youtubeBlockReason: 'Add a YouTube title.' }), 'Add a YouTube title.')

  console.log('youtubePublish.test.ts: all assertions passed')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
