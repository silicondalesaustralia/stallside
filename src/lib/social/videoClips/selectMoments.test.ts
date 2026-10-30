import assert from 'node:assert/strict'
import { fitPicks, picksToMoments, topUpPicks } from './momentRanges'
import { fallbackMoments, parseMomentResponse, wordsForClip } from './selectMoments'
import { buildSentences, fitRange, rangeTimes } from './sentences'
import type { ClipMoment, TranscriptWord } from './types'

const bounds = { min: 15, max: 30 }

// 30 sentences of 8 words (0.5s each = 4s of speech), each followed by a 1.5s pause.
const words: TranscriptWord[] = []
for (let k = 0; k < 30; k++) {
  for (let j = 0; j < 8; j++) {
    const s = k * 5.5 + j * 0.5
    words.push({ w: j === 7 ? `end${k}.` : `w${k}_${j}`, s, e: s + 0.45 })
  }
}
const duration = 30 * 5.5
const sentences = buildSentences(words)
assert.equal(sentences.length, 30, 'one sentence per full stop')
assert.equal(sentences[3].text.split(' ').length, 8)

const runOn = buildSentences([
  { w: 'no', s: 0, e: 0.4 },
  { w: 'stop', s: 0.5, e: 0.9 },
  { w: 'after', s: 2, e: 2.4 },
])
assert.equal(runOn.length, 2, 'long pause splits even without punctuation')

const t = rangeTimes(sentences, 2, 4, duration)
assert.ok(t.start < sentences[2].s && t.start > sentences[1].e, 'start padded into the pause before')
assert.ok(t.end > sentences[4].e && t.end < sentences[5].s, 'end padded into the pause after')

assert.deepEqual(fitRange(sentences, 0, 0, duration, bounds), [0, 2], 'grows by whole sentences to the minimum')
assert.deepEqual(fitRange(sentences, 0, 20, duration, bounds), [0, 5], 'shrinks from the end to the maximum')
assert.equal(fitRange(sentences, 5, 2, duration, bounds), null, 'invalid range')

const picks = parseMomentResponse(
  JSON.stringify({
    clips: [
      { startSentence: 10, endSentence: 13, title: 'Deck reveal', score: 90 },
      { startSentence: 12, endSentence: 14, title: 'overlaps', score: 80 },
      { startSentence: 'x', endSentence: 2 },
      { startSentence: 5, endSentence: 99 },
    ],
  }),
  sentences.length,
)
assert.equal(picks.length, 2, 'drops invalid / out-of-range picks')
assert.deepEqual(parseMomentResponse('not json', 10), [])

const fitted = fitPicks(picks, sentences, duration, bounds, 3)
assert.equal(fitted.length, 1, 'drops overlapping lower-scored pick')
const all = topUpPicks(fitted, sentences, duration, bounds, 3)
assert.equal(all.length, 3, 'tops up to the requested count')
const moments = picksToMoments(all, sentences, duration)

function assertCleanCuts(list: ClipMoment[]) {
  for (const m of list) {
    assert.ok(!words.some((w) => w.s < m.start && w.e > m.start), `start ${m.start} not inside a word`)
    assert.ok(!words.some((w) => w.s < m.end && w.e > m.end), `end ${m.end} not inside a word`)
    const inside = words.filter((w) => w.s >= m.start && w.e <= m.end)
    assert.ok(/\.$/.test(inside[inside.length - 1].w), 'clip ends on a full stop')
    assert.ok(m.end - m.start >= bounds.min * 0.85 && m.end - m.start <= bounds.max * 1.15, 'length in range')
  }
  list.forEach((m, i) => i > 0 && assert.ok(m.start >= list[i - 1].end, 'no overlaps'))
}
assertCleanCuts(moments)
assertCleanCuts(picksToMoments(topUpPicks([], sentences, duration, bounds, 4), sentences, duration))

const fb = fallbackMoments(300, bounds, 4)
assert.equal(fb.length, 4, 'timed fallback count')
assert.equal(fallbackMoments(10, bounds, 4).length, 1, 'short video → single clip')

assert.deepEqual(
  wordsForClip([{ w: 'hi', s: 9, e: 9.5 }, { w: 'there', s: 10.2, e: 10.6 }, { w: 'mate', s: 29.8, e: 30.4 }], 10, 30),
  [{ w: 'there', s: 0.2, e: 0.6 }],
  'words rebased to clip start',
)

console.log('selectMoments tests passed')
