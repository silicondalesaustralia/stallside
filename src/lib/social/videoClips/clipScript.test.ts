import assert from 'node:assert/strict'
import { clipScriptText, scriptFileName } from './clipScript'
import { buildVideoCaptionPrompt } from '../videoCaptionContext'

const words = [
  { w: 'Hi', s: 0, e: 0.3 },
  { w: 'there.', s: 0.3, e: 0.6 },
  { w: 'Flat', s: 2, e: 2.3 },
  { w: 'pack', s: 2.3, e: 2.6 },
  { w: 'discount.', s: 2.6, e: 3 },
]

assert.equal(clipScriptText({ words }), 'Hi there. Flat pack discount.', 'legacy docs derive the script from words')
assert.equal(
  clipScriptText({ words, cues: [{ s: 0, e: 0.6, text: 'Hi there.' }, { s: 2, e: 3, text: 'Flat-pack discount!' }] }),
  'Hi there. Flat-pack discount!',
  'edited cue text wins',
)
assert.equal(
  clipScriptText({ words, cleanDuration: 3, segments: [{ s: 2, e: 3 }], cues: [{ s: 0, e: 0.6, text: 'Hi there.' }, { s: 2, e: 3, text: 'Flat pack discount.' }] }),
  'Flat pack discount.',
  'cut sections are left out',
)
assert.equal(clipScriptText(null), '')
assert.equal(scriptFileName('Flat Pack Discount!'), 'flat-pack-discount-script.txt')
assert.equal(scriptFileName(null), 'video-script.txt')

const prompt = buildVideoCaptionPrompt({
  aboutText: null,
  script: 'We are offering ten percent off flat pack kitchens this month.',
  business: { name: 'Acme Joinery', services: null, suburb: null, brandVoice: null, cta: null, phone: null, website: null },
  job: null,
})
assert.ok(prompt.user.includes('VIDEO SCRIPT'), 'script section present')
assert.ok(prompt.user.includes('ten percent off flat pack kitchens'), 'script text in prompt')
assert.ok(prompt.system.includes('NOT watched'), 'still no video analysis')

console.log('clipScript tests passed')
