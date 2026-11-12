import { test } from 'node:test'
import assert from 'node:assert/strict'
import { composerDraftIsEmpty, parseComposerDraft, summarizeComposerDraft } from '@/lib/tradiespost/composer/composerDraft'
import { parseDraftRequestBody } from '@/lib/tradiespost/composer/composerDraftRequest'

const img = 'https://example.com/a.jpg'

test('parseComposerDraft keeps valid fields and drops junk', () => {
  const draft = parseComposerDraft({
    platforms: ['facebook', 'tiktok', 'myspace', 'facebook'],
    headline: 'Hi',
    caption: 'Fresh eggs',
    media: { url: img, renderId: 'r1', aiGenerated: true, video: { url: 'https://example.com/v.mp4', durationSeconds: 12 }, slides: [img, 'javascript:x'] },
    jobId: 'job-1',
    slideshow: { stage: 'edit', images: [img], slides: [{ imageUrl: img, heading: '', body: 'b' }], secondsPerSlide: 9, transition: 'spin' },
  })
  assert.ok(draft)
  assert.deepEqual(draft.platforms, ['facebook', 'tiktok'])
  assert.equal(draft.media?.video?.durationSeconds, 12)
  assert.deepEqual(draft.media?.slides, [img])
  assert.equal(draft.slideshow?.stage, 'edit')
  assert.equal(draft.slideshow?.slides[0].heading, '')
  assert.equal(draft.slideshow?.secondsPerSlide, 3)
  assert.equal(draft.slideshow?.transition, 'fade')
})

test('non-https media and empty slideshows are dropped', () => {
  const draft = parseComposerDraft({ media: { url: 'http://x/a.jpg' }, slideshow: { images: [] } })
  assert.ok(draft)
  assert.equal(draft.media, null)
  assert.equal(draft.slideshow, null)
  assert.equal(composerDraftIsEmpty(draft), true)
  assert.equal(parseComposerDraft('nope'), null)
})

test('save requests reject empty and oversized drafts', () => {
  assert.equal(parseDraftRequestBody({ draft: { platforms: ['facebook'] } }).ok, false)
  assert.equal(parseDraftRequestBody({ draft: { caption: 'x'.repeat(70_000) } }).ok, false)
  assert.equal(parseDraftRequestBody({ draft: { caption: 'Eggs' } }).ok, true)
})

test('summaries fall back to the first slideshow image', () => {
  const summary = summarizeComposerDraft('d1', '2026-01-01T00:00:00Z', { slideshow: { images: [img] } })
  assert.equal(summary.imageUrl, img)
  assert.equal(summary.caption, '')
})
