import { scriptFileName } from '@/lib/social/videoClips/clipScript'

async function fetchClipScript(clipId: string): Promise<{ title: string | null; script: string }> {
  const res = await fetch(`/api/social/videos/clips/${encodeURIComponent(clipId)}/script`)
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(json.error || 'Could not load the script')
  }
  const json = (await res.json()) as { title?: string | null; script?: string }
  const script = json.script?.trim() ?? ''
  if (!script) throw new Error('This clip has no spoken words to export')
  return { title: json.title ?? null, script }
}

export async function copyClipScript(clipId: string): Promise<void> {
  const { script } = await fetchClipScript(clipId)
  try {
    await navigator.clipboard.writeText(script)
  } catch {
    throw new Error('Could not copy the script')
  }
}

export async function downloadClipScript(clipId: string): Promise<void> {
  const { title, script } = await fetchClipScript(clipId)
  const url = URL.createObjectURL(new Blob([`${script}\n`], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = scriptFileName(title)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
