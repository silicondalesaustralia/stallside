import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mediaFromSavedPost } from './composerSlides'

test('duplicating a video post keeps the video', () => {
  const media = mediaFromSavedPost('https://x/cover.jpg', null, { url: 'https://x/v.mp4', durationSeconds: 12 })
  assert.deepEqual(media?.video, { url: 'https://x/v.mp4', durationSeconds: 12 })
  assert.equal(media?.url, 'https://x/cover.jpg')
})

test('duplicating a photo post keeps TikTok slides and no video', () => {
  const media = mediaFromSavedPost('https://x/1.jpg', { tiktok: ['https://x/1.jpg', 'https://x/2.jpg'] }, null)
  assert.equal(media?.video, undefined)
  assert.deepEqual(media?.slides, ['https://x/1.jpg', 'https://x/2.jpg'])
  assert.equal(media?.slidesKind, 'photos')
})
