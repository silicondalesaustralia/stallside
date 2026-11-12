import { test } from 'node:test'
import assert from 'node:assert/strict'
import { captionBlockReason, effectiveCaption } from './captionLimits'
import { composerPlatformCaptions, parsePlatformText, platformTextIsEmpty } from './platformText'
import { parseComposerDraft } from './composerDraft'
import {
  parsePlatformCaptionsReply,
  parsePlatformCaptionsRequest,
} from '../../social/platformCaptions/platformCaptionTypes'

test('blank platform captions fall back to the main caption', () => {
  assert.equal(effectiveCaption('instagram', 'Main', {}), 'Main')
  assert.equal(effectiveCaption('instagram', 'Main', { instagram: '  ' }), 'Main')
  assert.equal(effectiveCaption('instagram', 'Main', { instagram: 'IG only' }), 'IG only')
})

test('caption checks use each platform its own text and limit', () => {
  assert.equal(captionBlockReason(['instagram'], '', {}), 'Write a caption first.')
  assert.equal(captionBlockReason(['instagram'], '', { instagram: 'Own' }), null)
  const long = 'a'.repeat(900)
  assert.match(captionBlockReason(['facebook', 'pinterest'], long, {}) ?? '', /^Pinterest caption is too long/)
  assert.equal(captionBlockReason(['facebook', 'pinterest'], long, { pinterest: 'Short pin' }), null)
})

test('submit sends overrides, Facebook headline and X text for selected platforms only', () => {
  const out = composerPlatformCaptions({
    selected: ['facebook', 'instagram', 'x'],
    caption: 'Main',
    overrides: { instagram: 'IG', tiktok: 'not selected' },
    headline: 'Big news',
    xText: 'Short X',
  })
  assert.deepEqual(out, { instagram: 'IG', facebook: 'Big news\n\nMain', x: 'Short X' })
})

test('drafts keep per-platform text', () => {
  const draft = parseComposerDraft({ caption: 'Eggs', platformText: { captions: { tiktok: 'TT', bogus: 'x' }, youtubeTitle: 'Eggs!', xText: null } })
  assert.deepEqual(draft?.platformText.captions, { tiktok: 'TT' })
  assert.equal(draft?.platformText.youtubeTitle, 'Eggs!')
  assert.equal(platformTextIsEmpty(parsePlatformText(null)), true)
})

test('AI request and reply are validated and clipped per platform', () => {
  const req = parsePlatformCaptionsRequest({ platforms: ['youtube', 'x', 'myspace'], includeMain: true })
  assert.ok(req.ok)
  if (!req.ok) return
  assert.deepEqual(req.value.platforms, ['youtube', 'x'])
  const reply = JSON.stringify({
    main: 'Main caption',
    platforms: { youtube: { title: '<Eggs>', caption: 'Desc', tags: ['eggs', 'farm'] }, x: { caption: 'x'.repeat(400) } },
  })
  const result = parsePlatformCaptionsReply(reply, req.value)
  assert.equal(result.main, 'Main caption')
  assert.deepEqual(result.platforms.youtube, { caption: 'Desc', title: 'Eggs', tags: ['eggs', 'farm'] })
  assert.equal(result.platforms.x?.caption.length, 280)
  assert.equal(parsePlatformCaptionsRequest({ platforms: [] }).ok, false)
  assert.throws(() => parsePlatformCaptionsReply('not json', req.value))
})
