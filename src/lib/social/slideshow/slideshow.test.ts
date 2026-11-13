import assert from 'node:assert/strict'
import { slideshowDurationSeconds, slideshowFfmpegArgs } from './slideshowFfmpegArgs'
import { parseSlideshowRenderRequest, parseSlideshowWriteRequest } from './slideshowTypes'

const imgs = ['https://x/a.jpg', 'https://x/b.jpg', 'https://x/c.jpg']

const tooFew = parseSlideshowWriteRequest({ images: imgs.slice(0, 2) })
assert.equal(tooFew.ok, false)

const write = parseSlideshowWriteRequest({ images: [...imgs, 'http://insecure/d.jpg', 4], context: '  fresh   today ' })
assert.ok(write.ok)
assert.deepEqual(write.value.images, imgs)
assert.equal(write.value.context, 'fresh today')
assert.equal(write.value.jobId, null)

const slides = imgs.map((imageUrl, i) => ({ imageUrl, heading: `Slide ${i + 1}`, body: '' }))
const render = parseSlideshowRenderRequest({ slides, secondsPerSlide: 9, transition: 'spin' })
assert.ok(render.ok)
assert.equal(render.value.secondsPerSlide, 3)
assert.equal(render.value.transition, 'fade')

const missingHeading = parseSlideshowRenderRequest({ slides: [...slides.slice(0, 2), { imageUrl: imgs[2], heading: ' ' }] })
assert.equal(missingHeading.ok, false)

const plain = parseSlideshowRenderRequest({ slides: imgs.map((imageUrl) => ({ imageUrl, heading: '', body: '' })), showText: false })
assert.ok(plain.ok)
assert.equal(plain.value.showText, false)
assert.equal(render.value.showText, true)

assert.equal(slideshowDurationSeconds(5, 3), 15)

const fade = slideshowFfmpegArgs({ imagePaths: ['/w/1.jpg', '/w/2.jpg', '/w/3.jpg'], outputPath: '/w/o.mp4', secondsPerSlide: 3, transition: 'fade' })
const graph = fade[fade.indexOf('-filter_complex') + 1]
assert.match(graph, /\[v0\]\[v1\]xfade=transition=fade:duration=0.5:offset=3\[x1\]/)
assert.match(graph, /\[x1\]\[v2\]xfade=transition=fade:duration=0.5:offset=6\[x2\]/)
assert.equal(fade[fade.indexOf('-map') + 1], '[x2]')
assert.equal(fade[fade.indexOf('-t', fade.indexOf('-filter_complex')) + 1], '9')
assert.deepEqual(fade.slice(1, 9), ['-loop', '1', '-framerate', '30', '-t', '3.5', '-i', '/w/1.jpg'])
assert.ok(fade.includes('anullsrc=channel_layout=stereo:sample_rate=44100'))
assert.equal(fade.at(-1), '/w/o.mp4')

const cut = slideshowFfmpegArgs({ imagePaths: ['/w/1.jpg', '/w/2.jpg', '/w/3.jpg'], outputPath: '/w/o.mp4', secondsPerSlide: 2, transition: 'none' })
assert.match(cut[cut.indexOf('-filter_complex') + 1], /\[v0\]\[v1\]\[v2\]concat=n=3:v=1:a=0\[vout\]/)
assert.equal(cut[cut.indexOf('-map') + 1], '[vout]')
assert.deepEqual(cut.slice(1, 9), ['-loop', '1', '-framerate', '30', '-t', '2', '-i', '/w/1.jpg'])

const slide = slideshowFfmpegArgs({ imagePaths: ['/w/1.jpg', '/w/2.jpg'], outputPath: '/w/o.mp4', secondsPerSlide: 4, transition: 'slide' })
assert.match(slide[slide.indexOf('-filter_complex') + 1], /xfade=transition=slideleft:duration=0.5:offset=4/)

console.log('slideshow tests passed')
