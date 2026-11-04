import assert from 'node:assert/strict'
import { buildAssSubtitles } from './captionAss'
import { DEFAULT_CAPTION_SETTINGS, parseCaptionSettings } from './captionStyles'
import { overlayPosition, overlaySizeFromDrag, overlayWidthFromPointer } from './overlayLayout'
import { dragOverlayTime, newOverlayAt, sanitizeOverlays } from './textOverlays'
import { mapTimedToOutput } from './timeline'

const overlay = { ...newOverlayAt(2, 10), text: 'Before {\\b1}& after', font: 'oswald' as const, color: '#FFD100' }
const [clean] = sanitizeOverlays([overlay, { text: '' }, { text: 'too short', s: 1, e: 1.1 }], 10)
assert.equal(sanitizeOverlays([overlay, { text: '' }], 10).length, 1, 'drops empty overlays')
assert.equal(clean.text, 'Before b1& after', 'strips ASS override characters')
assert.equal(clean.font, 'oswald')
assert.equal(sanitizeOverlays([{ ...overlay, font: 'comic-sans', size: 99, x: 3 }], 10)[0].font, 'inter', 'unknown font → inter')
assert.equal(sanitizeOverlays([{ ...overlay, size: 99 }], 10)[0].size, 18, 'size clamped')
assert.equal(sanitizeOverlays([{ ...overlay, x: 3 }], 10)[0].x, 1, 'x clamped')
assert.equal(sanitizeOverlays([{ ...overlay, s: 8, e: 30 }], 10)[0].e, 10, 'end clamped to clip')

assert.equal(parseCaptionSettings({ font: 'anton' }).font, 'anton')
assert.equal(parseCaptionSettings({ font: 'nope' }).font, 'inter')

const moved = dragOverlayTime({ ...clean, s: 2, e: 5 }, 'move', 20, 10)
assert.deepEqual([moved.s, moved.e], [7, 10], 'move clamps to the end keeping length')

const mapped = mapTimedToOutput([{ ...clean, s: 1, e: 6 }], [{ s: 0, e: 2 }, { s: 5, e: 8 }])
assert.deepEqual(mapped.map((o) => [o.s, o.e]), [[1, 2], [2, 3]], 'overlay spanning a cut is split')

const ass = buildAssSubtitles({
  cues: [{ s: 0, e: 1, text: 'hello there' }],
  words: [],
  settings: { ...DEFAULT_CAPTION_SETTINGS, style: 'boxed', font: 'bebas-neue' },
  highlightColor: '#FFD100',
  width: 1080,
  height: 1920,
  overlays: [{ ...clean, x: 0.5, y: 0.25, size: 10, style: 'box', accent: '#112233' }],
})
assert.ok(ass.includes('Style: Caption,Bebas Neue,'), 'caption font in style')
assert.ok(ass.includes('Style: OverlayBox,'), 'overlay styles present')
const line = ass.split('\n').find((l) => l.includes('OverlayBox,,'))
assert.ok(line, 'overlay dialogue present')
assert.ok(line.includes('\\pos(540,480)'), 'position scaled to frame')
assert.ok(line.includes('\\fnOswald') && line.includes('\\fs108'), 'font + size')
assert.ok(line.includes('\\c&H00D1FF&') && line.includes('\\3c&H332211&'), 'colours in BGR')
for (const style of ass.split('\n').filter((l) => l.startsWith('Style:'))) {
  assert.equal(style.split(',').length, 23, `style has 23 fields: ${style}`)
}
assert.ok(line.includes('OverlayBox,,54,54,0,'), 'default 90% width leaves 5% each side')

assert.equal(sanitizeOverlays([{ ...overlay, width: 5 }], 10)[0].width, 20, 'width clamped')
assert.equal(sanitizeOverlays([{ ...overlay, width: undefined }], 10)[0].width, 90, 'older overlays get 90% width')
const narrow = buildAssSubtitles({
  cues: [],
  words: [],
  settings: { ...DEFAULT_CAPTION_SETTINGS, sideMargin: 0 },
  highlightColor: '#FFD100',
  width: 1080,
  height: 1920,
  overlays: [{ ...clean, width: 60 }],
})
assert.ok(narrow.includes(',OverlayLine,,216,216,0,'), '60% width wraps inside 216px margins')
const captionStyle = narrow.split('\n').find((l) => l.startsWith('Style: Caption,'))?.split(',') ?? []
assert.deepEqual(captionStyle.slice(19, 21), ['0', '0'], 'side space 0 lets captions reach the edges')
assert.equal(parseCaptionSettings({}).sideMargin, 8, 'older captions keep 8% side space')
assert.equal(parseCaptionSettings({ sideMargin: 50 }).sideMargin, 20, 'side space clamped')

assert.equal(overlayPosition(0.49, true), 0.5, 'snaps to the centre line')
assert.equal(overlayPosition(0.49, false), 0.49, 'free placement without snap')
assert.equal(overlayWidthFromPointer(0.9, 0.5, true), 80, 'width from handle distance, snapped to 5%')
assert.equal(overlaySizeFromDrag(9, 100, 200), 18, 'dragging twice as far doubles the size')
assert.equal(overlaySizeFromDrag(9, 100, 10), 3, 'size clamped to the minimum')

const noCaptions = buildAssSubtitles({
  cues: [{ s: 0, e: 1, text: 'hidden' }],
  words: [],
  settings: { ...DEFAULT_CAPTION_SETTINGS, style: 'none' },
  highlightColor: '#FFD100',
  width: 1080,
  height: 1920,
  overlays: [clean],
})
assert.ok(!noCaptions.includes('hidden'), 'style none drops captions but keeps overlays')
assert.ok(noCaptions.includes('Before b1& after'))

console.log('textOverlays tests passed')
