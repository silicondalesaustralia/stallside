/**
 * One-off: builds Vendl's music library from FreePD (CC0) via the SoundSafari mirror.
 *  1. Parses archived FreePD category pages (cached in /tmp/freepd/<category>.html).
 *  2. Downloads each track, normalises loudness, caps at 150s with a fade, encodes 112k MP3.
 *  3. Uploads to the public social-music bucket (freepd/<id>.mp3) and writes src/lib/social/music/musicCatalog.json.
 * Run: npx tsx --env-file=.env scripts/music/buildMusicCatalog.mts
 */
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { createClient } from '@supabase/supabase-js'
import { parseFreePdPage, type FreePdRow } from './parseFreePd.mjs'
import { MUSIC_BUCKET, type MusicCategory, type MusicTrack } from '../../src/lib/social/music/musicTypes'

const run = promisify(execFile)
const CACHE = '/tmp/freepd'
const MAX_SECONDS = 150
const FADE_SECONDS = 3
const MIRROR = 'https://raw.githubusercontent.com/SoundSafari/CC0-1.0-Music/main/freepd.com'
const PAGES: [string, MusicCategory][] = [
  ['upbeat', 'upbeat'], ['comedy', 'fun'], ['romantic', 'calm'], ['epic', 'cinematic'],
  ['scoring', 'cinematic'], ['world', 'world'], ['electronic', 'electronic'], ['misc', 'more'],
]

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function probeSeconds(path: string): Promise<number> {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path])
  return Number(stdout.trim()) || 0
}

async function prepare(row: FreePdRow, dir: string): Promise<{ out: string; seconds: number }> {
  const raw = join(dir, `${slug(row.file)}.src.mp3`)
  const out = join(dir, `${slug(row.file)}.mp3`)
  if (!existsSync(out)) {
    if (!existsSync(raw)) {
      const res = await fetch(`${MIRROR}/${encodeURIComponent(`${row.file}.mp3`)}`)
      if (!res.ok) throw new Error(`download ${row.file}: ${res.status}`)
      await writeFile(raw, Buffer.from(await res.arrayBuffer()))
    }
    const source = await probeSeconds(raw)
    const capped = Math.min(source, MAX_SECONDS)
    const filters = ['loudnorm=I=-16:TP=-1.5:LRA=11']
    if (source > MAX_SECONDS) filters.push(`afade=t=out:st=${capped - FADE_SECONDS}:d=${FADE_SECONDS}`)
    await run('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-t', String(capped), '-af', filters.join(','),
      '-ar', '44100', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '112k', '-map_metadata', '-1', out])
  }
  return { out, seconds: Math.round((await probeSeconds(out)) * 10) / 10 }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  const db = createClient(url, key, { auth: { persistSession: false } })
  const { error: bucketErr } = await db.storage.createBucket(MUSIC_BUCKET, {
    public: true,
    allowedMimeTypes: ['audio/mpeg'],
    fileSizeLimit: '10MB',
  })
  if (bucketErr && !/already exists/i.test(bucketErr.message)) throw new Error(`bucket: ${bucketErr.message}`)
  const dir = join(CACHE, 'out')
  await mkdir(dir, { recursive: true })

  const seen = new Set<string>()
  const rows: { row: FreePdRow; category: MusicCategory }[] = []
  for (const [page, category] of PAGES) {
    for (const row of parseFreePdPage(await readFile(join(CACHE, `${page}.html`), 'utf8'), page)) {
      if (seen.has(row.file)) continue
      seen.add(row.file)
      rows.push({ row, category })
    }
  }

  const tracks: MusicTrack[] = []
  let next = 0
  async function worker() {
    while (next < rows.length) {
      const { row, category } = rows[next++]
      try {
        const { out, seconds } = await prepare(row, dir)
        const id = slug(row.file)
        const path = `freepd/${id}.mp3`
        const { error } = await db.storage.from(MUSIC_BUCKET).upload(path, await readFile(out), {
          contentType: 'audio/mpeg', cacheControl: '31536000', upsert: true,
        })
        if (error) throw new Error(`upload ${id}: ${error.message}`)
        tracks.push({ id, title: row.title, artist: row.artist, category, description: row.description.slice(0, 300),
          durationSeconds: seconds, path, rank: row.rank })
        console.log(`ok ${tracks.length}/${rows.length} ${id}`)
      } catch (err) {
        console.warn(`skip ${row.file}:`, err instanceof Error ? err.message : err)
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker))

  tracks.sort((a, b) => a.category.localeCompare(b.category) || a.rank - b.rank)
  const target = join(process.cwd(), 'src/lib/social/music/musicCatalog.json')
  await writeFile(target, `${JSON.stringify(tracks, null, 1)}\n`)
  console.log(`Wrote ${tracks.length} tracks to ${target}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
