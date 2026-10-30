import assert from 'node:assert/strict'
import { assTime, buildAssSubtitles, hexToAssOverrideColor } from './captionAss'
import { groupWordsIntoCues, parseCaptionsDoc, sanitizeCues, wordsForCue } from './captionCues'
import { DEFAULT_CAPTION_SETTINGS, parseCaptionSettings, resolveHighlightColor } from './captionStyles'

const words = [
  { w: 'We', s: 0, e: 0.2 },
  { w: 'fixed', s: 0.2, e: 0.5 },
  { w: 'the', s: 0.5, e: 0.6 },
  { w: 'leak', s: 0.6, e: 1.0 },
  { w: 'today.', s: 1.0, e: 1.4 },
  { w: 'Easy', s: 2.5, e: 2.9 },
]

const cues = groupWordsIntoCues(words)
assert.deepEqual(cues.map((c) => c.text), ['We fixed the leak', 'today.', 'Easy'])
assert.equal(cues[0].s, 0)
assert.equal(cues[0].e, 1.0)

assert.equal(wordsForCue(cues[0], words).length, 4, 'unedited cue keeps real word timings')
const edited = wordsForCue({ s: 0, e: 1, text: 'We fixed it' }, words)
assert.deepEqual(edited.map((w) => w.w), ['We', 'fixed', 'it'])
assert.equal(edited[2].e, 1, 'edited cue spreads words evenly to cue end')

assert.equal(assTime(61.234), '0:01:01.23')
assert.equal(hexToAssOverrideColor('#FFD100'), '&H00D1FF&')
assert.equal(resolveHighlightColor(DEFAULT_CAPTION_SETTINGS, '#123abc'), '#123ABC')
assert.equal(resolveHighlightColor({ ...DEFAULT_CAPTION_SETTINGS, highlightColor: '#FF0000' }, '#123abc'), '#FF0000')

const ass = buildAssSubtitles({
  cues,
  words,
  settings: DEFAULT_CAPTION_SETTINGS,
  highlightColor: '#FFD100',
  width: 1080,
  height: 1920,
})
assert.ok(ass.includes('PlayResX: 1080'))
assert.ok(ass.includes('{\\c&H00D1FF&}FIXED{\\c&HFFFFFF&}'), 'bold style highlights the spoken word')

const boxed = buildAssSubtitles({
  cues,
  words,
  settings: parseCaptionSettings({ style: 'boxed' }),
  highlightColor: '#FFD100',
  width: 1080,
  height: 1920,
})
assert.ok(boxed.includes(',Caption,,0,0,0,,We fixed the leak'), 'boxed style shows whole line')
assert.ok(boxed.includes(',&H59000000,&H80000000,-1,'), 'box colour carries 65% opacity')

const custom = buildAssSubtitles({
  cues,
  words,
  settings: parseCaptionSettings({ style: 'bold', position: 'top', textColor: '#ff0000', accentColor: '#00ff00', uppercase: false, bold: false, wordHighlight: false, size: 10 }),
  highlightColor: '#FFD100',
  width: 1080,
  height: 1920,
})
const style = custom.split('\n').find((l) => l.startsWith('Style: Caption,')) ?? ''
const fields = style.split(',')
assert.equal(fields.length, 23, 'caption style line keeps all 23 ASS fields')
assert.equal(fields[2], '108', 'size is a percentage of the shorter side')
assert.equal(fields[3], '&H000000FF', 'text colour')
assert.equal(fields[5], '&H0000FF00', 'outline colour')
assert.equal(fields[7], '0', 'bold off')
assert.equal(fields[18], '8', 'top placement')
assert.ok(custom.includes(',Caption,,0,0,0,,We fixed the leak'), 'no caps and no word highlight')
assert.ok(!custom.includes('\\c'), 'no highlight overrides when disabled')
assert.equal(parseCaptionSettings({ boxOpacity: 500 }).boxOpacity, 100)

const clean = sanitizeCues([{ s: 0, e: 99, text: ' {bad}\\ text ' }, { s: 'x', e: 1, text: 'drop' }], 10)
assert.deepEqual(clean, [{ s: 0, e: 10, text: 'bad text' }])

const legacy = parseCaptionsDoc({ words })
assert.equal(legacy.cues.length, 3, 'legacy docs derive cues from words')
assert.equal(legacy.cleanPath, null)

console.log('captions tests passed')
