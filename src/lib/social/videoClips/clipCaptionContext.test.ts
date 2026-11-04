import assert from 'node:assert/strict'
import { clipOverlayTexts } from './clipOverlayText'
import { buildVideoCaptionPrompt, type VideoCaptionContext } from '../videoCaptionContext'
import {
  cleanVideoPostTitle,
  fallbackVideoPostTitle,
  parseVideoCaptionResponse,
} from '../videoCaptionTitle'
import { generateVideoCaption } from '../generateVideoCaption'

const overlay = (s: number, e: number, text: string) => ({ id: `o${s}`, s, e, text, x: 0.5, y: 0.5 })

const captions = {
  cleanDuration: 10,
  segments: [{ s: 0, e: 4 }, { s: 6, e: 10 }],
  overlays: [
    overlay(7, 9, 'Comment BERRIES below'),
    overlay(0.5, 3, 'Pick your own this Saturday'),
    overlay(4.2, 5.8, 'Cut section text'),
    overlay(8, 9.5, 'comment berries below'),
  ],
}

assert.deepEqual(
  clipOverlayTexts(captions),
  ['Pick your own this Saturday', 'Comment BERRIES below'],
  'overlays come out in play order, cut sections and duplicates removed',
)
assert.deepEqual(clipOverlayTexts(null), [], 'no captions doc means no overlays')

const business = { name: 'Hill Farm', services: null, suburb: null, brandVoice: null, cta: null, phone: null, website: null }
const ctx: VideoCaptionContext = {
  aboutText: null,
  script: 'Strawberries are ready to pick.',
  overlayTexts: clipOverlayTexts(captions),
  sourceTitle: 'Strawberry picking day',
  clipTitle: 'Berries are ready',
  business,
  job: null,
}
const prompt = buildVideoCaptionPrompt(ctx)
assert.ok(prompt.user.includes('ON-SCREEN TEXT'), 'on-screen text section present')
assert.ok(prompt.user.includes('- Comment BERRIES below'), 'overlay text in prompt')
assert.ok(!prompt.user.includes('Cut section text'), 'cut overlay not in prompt')
assert.ok(prompt.user.includes('Name the seller gave the video: Strawberry picking day'), 'source name in prompt')
assert.ok(prompt.user.includes('Clip title: Berries are ready'), 'clip title in prompt')
assert.ok(prompt.user.includes("follow the seller's video name"), 'seller name wins on disagreement')
assert.ok(prompt.system.includes('"title"'), 'model is asked for a title')
assert.ok(prompt.system.includes('never contradict'), 'on-screen CTA is repeated, not contradicted')

const bare = buildVideoCaptionPrompt({ aboutText: null, business, job: null })
assert.ok(bare.user.includes('ON-SCREEN TEXT (added by the seller, in order):\n(none)'), 'empty overlays say none')
assert.ok(bare.user.includes('VIDEO NAME:\n(none)'), 'empty names say none')

assert.ok(prompt.system.includes('"tags"'), 'model is asked for YouTube tags')
assert.ok(prompt.system.includes('HOOK'), 'shared copywriting framework is in the prompt')

assert.deepEqual(
  parseVideoCaptionResponse('{"caption":"Fresh berries!","title":"Pick your own strawberries","tags":"berries, Hill Farm, #berries"}'),
  { caption: 'Fresh berries!', title: 'Pick your own strawberries', tags: ['berries', 'Hill Farm'] },
)
assert.deepEqual(parseVideoCaptionResponse('Plain caption text'), { caption: 'Plain caption text', title: null, tags: [] })
assert.equal(parseVideoCaptionResponse('{"title":"No caption"}'), null, 'JSON without caption is rejected')
assert.equal(cleanVideoPostTitle('"Fresh berries #local"'), 'Fresh berries')
assert.ok((cleanVideoPostTitle('word '.repeat(40)) ?? '').length <= 70, 'titles are capped')

assert.equal(fallbackVideoPostTitle({ sourceTitle: 'My name', clipTitle: 'Clip' }), 'My name')
assert.equal(fallbackVideoPostTitle({ clipTitle: 'Clip' }), 'Clip')
assert.equal(fallbackVideoPostTitle({ aboutText: 'First line here. Second.' }), 'First line here.')
assert.equal(fallbackVideoPostTitle({}), null)

async function run() {
  const ai = await generateVideoCaption(ctx, async () => '{"caption":"Come pick!","title":"Strawberry season is here"}')
  assert.deepEqual(ai, { caption: 'Come pick!', title: 'Strawberry season is here', tags: [] })
  const noTitle = await generateVideoCaption(ctx, async () => '{"caption":"Come pick!"}')
  assert.equal(noTitle.title, 'Strawberry picking day', 'missing title falls back to the seller name')
  const failed = await generateVideoCaption(ctx, async () => {
    throw new Error('demo')
  })
  assert.ok(failed.caption.length > 0, 'fallback caption when the model fails')
  console.log('clipCaptionContext tests passed')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
