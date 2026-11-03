'use client'

import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { audioMutesFrom, audioPartsFrom, type AudioPart } from '@/lib/social/videoClips/audioEdits'
import type { CaptionCue } from '@/lib/social/videoClips/captionCues'
import { DEFAULT_CAPTION_SETTINGS, type CaptionSettings } from '@/lib/social/videoClips/captionStyles'
import { MAX_OVERLAYS, newOverlayAt, type TextOverlay } from '@/lib/social/videoClips/textOverlays'
import type { ClipSegment } from '@/lib/social/videoClips/timeline'
import { cueIndexAt } from '@/lib/social/videoClips/timelineEdits'
import { fetchClipCaptions, saveClipCaptions, type ClipCaptions, type ClipEdit } from './captionsApi'
import { useClipPlayback } from './useClipPlayback'

/**
 * Editor state for one clip. All times are seconds of the caption-free clip.
 * `load` must be stable (module-level or memoised) - it re-runs whenever it changes.
 */
export function useClipEditor(clipId: string, load: (id: string) => Promise<ClipCaptions> = fetchClipCaptions) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [cues, setCues] = useState<CaptionCue[]>([])
  const [segments, setSegments] = useState<ClipSegment[]>([])
  const [overlays, setOverlays] = useState<TextOverlay[]>([])
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null)
  const [settings, setSettings] = useState<CaptionSettings>(DEFAULT_CAPTION_SETTINGS)
  const [speed, setSpeed] = useState(1)
  const [audioParts, setAudioParts] = useState<AudioPart[]>([])
  const playback = useClipPlayback(videoRef, segments, audioParts)
  const { time } = playback

  useEffect(() => {
    let cancelled = false
    load(clipId)
      .then((data) => {
        if (cancelled) return
        setCues(data.cues)
        setSettings(data.settings)
        setSegments(data.segments)
        setOverlays(data.overlays ?? [])
        setSpeed(data.speed ?? 1)
        setAudioParts(audioPartsFrom(data.audioMutes ?? [], data.durationSeconds))
        setDuration(data.durationSeconds)
        setPreviewUrl(data.previewUrl)
        setRendering(data.rendering)
      })
      .catch((err: unknown) => toast(err instanceof Error ? err.message : 'Could not load clip', 'error'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [clipId, load, toast])

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed
  }, [speed, previewUrl, loading])

  function addOverlay() {
    if (overlays.length >= MAX_OVERLAYS) {
      toast(`Up to ${MAX_OVERLAYS} text overlays per clip`, 'error')
      return
    }
    const overlay = newOverlayAt(time, duration)
    setOverlays([...overlays, overlay])
    setSelectedOverlayId(overlay.id)
  }

  function updateOverlay(id: string, patch: Partial<TextOverlay>) {
    setOverlays((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }

  function removeOverlay(id: string) {
    setOverlays((list) => list.filter((o) => o.id !== id))
    setSelectedOverlayId(null)
  }

  const edit: ClipEdit = { cues, settings, segments, overlays, speed, audioMutes: audioMutesFrom(audioParts) }

  async function save(): Promise<boolean> {
    setSaving(true)
    try {
      await saveClipCaptions(clipId, edit)
      toast('Updating clip — the new version will appear in a minute', 'success')
      return true
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not update clip', 'error')
      return false
    } finally {
      setSaving(false)
    }
  }

  return {
    videoRef,
    loading,
    saving,
    rendering,
    busy: loading || saving || rendering,
    previewUrl,
    duration,
    cues,
    setCues,
    segments,
    setSegments,
    overlays,
    setOverlays,
    selectedOverlay: overlays.find((o) => o.id === selectedOverlayId) ?? null,
    setSelectedOverlayId,
    addOverlay,
    updateOverlay,
    removeOverlay,
    settings,
    setSettings,
    speed,
    setSpeed,
    audioParts,
    setAudioParts,
    ...playback,
    activeIndex: cueIndexAt(cues, time),
    edit,
    save,
  }
}
